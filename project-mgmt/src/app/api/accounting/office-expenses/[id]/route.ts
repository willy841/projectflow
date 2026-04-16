import { NextResponse } from 'next/server';
import { createPhase1DbClient } from '@/lib/db/phase1-client';
import { requireAdminApi } from '@/lib/api-auth';

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApi();
  if (auth) return auth;

  try {
    const { id } = await context.params;
    const body = (await request.json()) as {
      expenseMonth?: string;
      itemName?: string;
      categoryId?: string;
      amount?: number | string;
      note?: string;
    };
    const db = createPhase1DbClient();
    await db.query(`
      update accounting_office_expenses
      set expense_month = $1, item_name = $2, category_id = $3, amount = $4, note = $5
      where id = $6
    `, [body.expenseMonth, body.itemName?.trim() ?? '', body.categoryId, Number(body.amount ?? 0), body.note?.trim() || null, id]);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'Unknown office expense update error' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApi();
  if (auth) return auth;

  try {
    const { id } = await context.params;
    const db = createPhase1DbClient();
    await db.query(`delete from accounting_office_expenses where id = $1`, [id]);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'Unknown office expense delete error' }, { status: 500 });
  }
}
