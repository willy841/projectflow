import { NextResponse } from 'next/server';
import { createPhase1DbClient } from '@/lib/db/phase1-client';
import { ensureProjectDbWriteEnabled } from '@/lib/db/project-flow-guard';
import { createPhase1Repositories } from '@/lib/db/phase1-repositories';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; itemId: string }> },
) {
  try {
    const access = ensureProjectDbWriteEnabled();
    if (!access.ok) {
      return access.response;
    }

    const { id, itemId } = await params;
    const body = (await request.json()) as { title?: string };
    const title = body.title?.trim();
    if (!title) {
      return NextResponse.json({ ok: false, error: '項目名稱必填' }, { status: 400 });
    }

    const repositories = createPhase1Repositories(createPhase1DbClient());
    const existing = await repositories.executionItems.listByProject(id);
    const target = existing.find((item) => item.id === itemId);
    if (!target) {
      return NextResponse.json({ ok: false, error: '找不到執行項目' }, { status: 404 });
    }

    const item = await repositories.executionItems.update(itemId, { title });
    return NextResponse.json({ ok: true, item, storage: access.storage });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'Unknown update execution item error' }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; itemId: string }> },
) {
  try {
    const access = ensureProjectDbWriteEnabled();
    if (!access.ok) {
      return access.response;
    }

    const { id, itemId } = await params;
    const repositories = createPhase1Repositories(createPhase1DbClient());
    const existing = await repositories.executionItems.listByProject(id);
    const target = existing.find((item) => item.id === itemId);
    if (!target) {
      return NextResponse.json({ ok: false, error: '找不到執行項目' }, { status: 404 });
    }

    const childIds = existing.filter((item) => item.parent_id === itemId).map((item) => item.id);
    for (const childId of childIds) {
      await repositories.executionItems.delete(childId);
    }
    await repositories.executionItems.delete(itemId);

    return NextResponse.json({ ok: true, deletedId: itemId, childIds, storage: access.storage });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'Unknown delete execution item error' }, { status: 500 });
  }
}
