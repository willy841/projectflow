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
      amount?: number | string;
      note?: string;
    };
    const db = createPhase1DbClient();
    await db.query(`
      update accounting_other_expenses
      set expense_month = $1, item_name = $2, amount = $3, note = $4
      where id = $5
    `, [body.expenseMonth, body.itemName?.trim() ?? '', Number(body.amount ?? 0), body.note?.trim() || null, id]);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'Unknown other expense update error' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApi();
  if (auth) return auth;

  try {
    const { id } = await context.params;
    const db = createPhase1DbClient();
    await db.query(`delete from accounting_other_expenses where id = $1`, [id]);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'Unknown other expense delete error' }, { status: 500 });
  }
}
