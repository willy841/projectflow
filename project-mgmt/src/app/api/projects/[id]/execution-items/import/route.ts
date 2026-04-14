import { NextResponse } from 'next/server';
import { createPhase1DbClient } from '@/lib/db/phase1-client';
import { ensureProjectDbWriteEnabled } from '@/lib/db/project-flow-guard';
import { createPhase1Repositories } from '@/lib/db/phase1-repositories';

type ImportChildInput = { title?: string };
type ImportMainInput = { title?: string; children?: ImportChildInput[] };

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const access = ensureProjectDbWriteEnabled();
  if (!access.ok) {
    return access.response;
  }

  const db = createPhase1DbClient();

  try {
    const { id } = await params;
    const body = (await request.json()) as { items?: ImportMainInput[] };
    const items = Array.isArray(body.items) ? body.items : [];
    if (!items.length) {
      return NextResponse.json({ ok: false, error: '缺少可匯入的主項目' }, { status: 400 });
    }

    const repositories = createPhase1Repositories(db);
    const existing = await repositories.executionItems.listByProject(id);
    let nextMainSortOrder = existing.filter((item) => item.parent_id == null).length + 1;

    const persistedItems: Array<{ id: string; title: string; status: string; category: string; detail: string; children: Array<{ id: string; title: string; status: string; assignee: string; category: string }> }> = [];

    await db.query('begin');
    try {
      for (const mainItem of items) {
        const mainTitle = mainItem.title?.trim();
        if (!mainTitle) continue;

        const createdMain = await repositories.executionItems.insert({
          project_id: id,
          parent_id: null,
          seq_code: `ITEM-${nextMainSortOrder}`,
          title: mainTitle,
          size: null,
          material: null,
          structure: null,
          quantity: null,
          note: null,
          sort_order: nextMainSortOrder,
        });
        nextMainSortOrder += 1;

        let nextChildSortOrder = 1;
        const persistedChildren: Array<{ id: string; title: string; status: string; assignee: string; category: string }> = [];

        for (const child of mainItem.children ?? []) {
          const childTitle = child.title?.trim();
          if (!childTitle) continue;

          const createdChild = await repositories.executionItems.insert({
            project_id: id,
            parent_id: createdMain.id,
            seq_code: `SUB-${nextChildSortOrder}`,
            title: childTitle,
            size: null,
            material: null,
            structure: null,
            quantity: null,
            note: null,
            sort_order: nextChildSortOrder,
          });
          nextChildSortOrder += 1;

          persistedChildren.push({
            id: createdChild.id,
            title: createdChild.title,
            status: '待交辦',
            assignee: '未指派',
            category: '專案',
          });
        }

        persistedItems.push({
          id: createdMain.id,
          title: createdMain.title,
          status: '待交辦',
          category: '專案',
          detail: createdMain.note ?? '待補充執行說明。',
          children: persistedChildren,
        });
      }

      await db.query('commit');
    } catch (error) {
      await db.query('rollback');
      throw error;
    }

    return NextResponse.json({ ok: true, items: persistedItems, storage: access.storage });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'Unknown bulk import execution items error' }, { status: 500 });
  }
}
