import { NextResponse } from 'next/server';
import { createPhase1DbClient } from '@/lib/db/phase1-client';
import { requireAdminApi } from '@/lib/api-auth';

export async function POST(request: Request) {
  const auth = await requireAdminApi();
  if (auth) return auth;

  try {
    const body = (await request.json()) as {
      expenseMonth?: string;
      itemName?: string;
      categoryId?: string;
      amount?: number | string;
      note?: string;
    };
    const db = createPhase1DbClient();
    const result = await db.query(`
      insert into accounting_office_expenses (expense_month, item_name, category_id, amount, note)
      values ($1, $2, $3, $4, $5)
      returning id
    `, [body.expenseMonth, body.itemName?.trim() ?? '', body.categoryId, Number(body.amount ?? 0), body.note?.trim() || null]);
    return NextResponse.json({ ok: true, id: result.rows[0]?.id ?? null });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'Unknown office expense create error' }, { status: 500 });
  }
}
