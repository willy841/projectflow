import { NextResponse } from 'next/server';
import { createPhase1DbClient } from '@/lib/db/phase1-client';
import { createPhase1Repositories } from '@/lib/db/phase1-repositories';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = (await request.json()) as {
      title?: string;
      parentId?: string | null;
    };

    const title = body.title?.trim();
    if (!title) {
      return NextResponse.json({ ok: false, error: '項目名稱必填' }, { status: 400 });
    }

    const repositories = createPhase1Repositories(createPhase1DbClient());
    const existing = await repositories.executionItems.listByProject(id);
    const siblings = existing.filter((item) => (item.parent_id ?? null) === (body.parentId ?? null));
    const item = await repositories.executionItems.insert({
      project_id: id,
      parent_id: body.parentId ?? null,
      seq_code: body.parentId ? `SUB-${siblings.length + 1}` : `ITEM-${siblings.length + 1}`,
      title,
      size: null,
      material: null,
      structure: null,
      quantity: null,
      note: null,
      sort_order: siblings.length + 1,
    });

    return NextResponse.json({ ok: true, item });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'Unknown create execution item error' }, { status: 500 });
  }
}
