import { NextResponse } from 'next/server';
import { createPhase1DbClient } from '@/lib/db/phase1-client';

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const db = createPhase1DbClient();
    await db.query(`delete from project_collection_records where id = $1`, [id]);
    return NextResponse.json({ ok: true, deletedId: id, semantics: 'idempotent-delete' });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'Unknown collection delete error' }, { status: 500 });
  }
}
