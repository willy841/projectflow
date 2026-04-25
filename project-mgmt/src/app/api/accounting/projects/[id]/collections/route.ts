import { NextResponse } from 'next/server';
import { createPhase1DbClient } from '@/lib/db/phase1-client';

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as {
      collectedOn?: string;
      amount?: number | string;
      note?: string;
    };
    const db = createPhase1DbClient();
    const amount = Number(body.amount ?? 0);

    const quotationRow = await db.query<{ total: number | null }>(`
      select total_amount::float8 as total
      from financial_quotation_imports
      where project_id = $1
      order by imported_at desc nulls last, created_at desc nulls last
      limit 1
    `, [id]);
    const receivableTotal = quotationRow.rows[0]?.total ?? 0;

    const collectedRow = await db.query<{ total: number | null }>(`
      select coalesce(sum(amount), 0)::float8 as total
      from project_collection_records
      where project_id = $1
    `, [id]);
    const collectedTotal = collectedRow.rows[0]?.total ?? 0;

    if (receivableTotal > 0 && collectedTotal + amount > receivableTotal) {
      return NextResponse.json(
        {
          ok: false,
          error: `收款金額超過應收總金額：目前應收 ${receivableTotal.toLocaleString('en-US')}，已收 ${collectedTotal.toLocaleString('en-US')}，本次新增 ${amount.toLocaleString('en-US')}。`,
        },
        { status: 400 },
      );
    }

    const result = await db.query(`
      insert into project_collection_records (project_id, collected_on, amount, note)
      values ($1, $2, $3, $4)
      returning id
    `, [id, body.collectedOn, amount, body.note?.trim() || null]);
    return NextResponse.json({ ok: true, id: result.rows[0]?.id ?? null });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'Unknown collection create error' }, { status: 500 });
  }
}
