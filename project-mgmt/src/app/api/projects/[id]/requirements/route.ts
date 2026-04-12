import { NextResponse } from 'next/server';
import { createPhase1DbClient } from '@/lib/db/phase1-client';
import { ensureProjectDbWriteEnabled } from '@/lib/db/project-flow-guard';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const access = ensureProjectDbWriteEnabled();
    if (!access.ok) return access.response;

    const { id } = await params;
    const body = (await request.json()) as { title?: string };
    const title = body.title?.trim();
    if (!title) {
      return NextResponse.json({ ok: false, error: '需求溝通內容必填' }, { status: 400 });
    }

    const db = createPhase1DbClient();
    const sortRows = await db.query<{ nextSortOrder: number }>(`
      select coalesce(max(sort_order), -1) + 1 as "nextSortOrder"
      from project_requirements
      where project_id = $1
    `, [id]);

    const result = await db.query(`
      insert into project_requirements (project_id, title, sort_order)
      values ($1, $2, $3)
      returning id, title, sort_order as "sortOrder", to_char(created_at, 'YYYY-MM-DD HH24:MI') as "createdAt", to_char(updated_at, 'YYYY-MM-DD HH24:MI') as "updatedAt"
    `, [id, title, sortRows.rows[0]?.nextSortOrder ?? 0]);

    return NextResponse.json({ ok: true, item: result.rows[0], storage: access.storage });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'Unknown create project requirement error' }, { status: 500 });
  }
}
