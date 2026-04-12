import { NextResponse } from 'next/server';
import { createPhase1DbClient } from '@/lib/db/phase1-client';
import { ensureProjectDbWriteEnabled } from '@/lib/db/project-flow-guard';

export async function PATCH(request: Request, { params }: { params: Promise<{ requirementId: string }> }) {
  try {
    const access = ensureProjectDbWriteEnabled();
    if (!access.ok) return access.response;

    const { requirementId } = await params;
    const body = (await request.json()) as { title?: string };
    const title = body.title?.trim();
    if (!title) {
      return NextResponse.json({ ok: false, error: '需求溝通內容必填' }, { status: 400 });
    }

    const db = createPhase1DbClient();
    const result = await db.query(`
      update project_requirements
      set title = $2, updated_at = now()
      where id = $1
      returning id, title, sort_order as "sortOrder", to_char(created_at, 'YYYY-MM-DD HH24:MI') as "createdAt", to_char(updated_at, 'YYYY-MM-DD HH24:MI') as "updatedAt"
    `, [requirementId, title]);

    if (!result.rows[0]) {
      return NextResponse.json({ ok: false, error: '找不到需求溝通紀錄' }, { status: 404 });
    }

    return NextResponse.json({ ok: true, item: result.rows[0], storage: access.storage });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'Unknown update project requirement error' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ requirementId: string }> }) {
  try {
    const access = ensureProjectDbWriteEnabled();
    if (!access.ok) return access.response;

    const { requirementId } = await params;
    const db = createPhase1DbClient();
    await db.query(`delete from project_requirements where id = $1`, [requirementId]);

    return NextResponse.json({ ok: true, deletedRequirementId: requirementId, storage: access.storage });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'Unknown delete project requirement error' }, { status: 500 });
  }
}
