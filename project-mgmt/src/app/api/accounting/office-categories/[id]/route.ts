import { NextResponse } from 'next/server';
import { createPhase1DbClient } from '@/lib/db/phase1-client';

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const db = createPhase1DbClient();
    const usage = await db.query<{ count: number }>(`select count(*)::int as count from accounting_office_expenses where category_id = $1`, [id]);
    if ((usage.rows[0]?.count ?? 0) > 0) {
      return NextResponse.json({ ok: false, error: '此分類已有既有支出使用，暫不可刪除' }, { status: 400 });
    }
    await db.query(`delete from accounting_office_categories where id = $1`, [id]);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'Unknown office category delete error' }, { status: 500 });
  }
}
