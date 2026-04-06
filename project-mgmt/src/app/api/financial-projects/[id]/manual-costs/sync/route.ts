import { NextResponse } from 'next/server';
import { createPhase1DbClient } from '@/lib/db/phase1-client';

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as {
      items?: Array<{
        id?: string;
        itemName?: string;
        description?: string;
        amount?: number | string;
        includedInCost?: boolean;
      }>;
    };

    const items = (body.items ?? []).filter((item) => item.itemName?.trim());
    const db = createPhase1DbClient();

    await db.query('begin');
    try {
      await db.query('delete from financial_manual_costs where project_id = $1', [id]);

      const rows: Array<Record<string, unknown>> = [];
      for (const [index, item] of items.entries()) {
        const amountNumber = Number(item.amount ?? 0);
        const result = await db.query(
          `
            insert into financial_manual_costs (
              project_id,
              item_name,
              description,
              amount,
              included_in_cost,
              sort_order
            )
            values ($1, $2, $3, $4, $5, $6)
            returning *
          `,
          [
            id,
            item.itemName?.trim() ?? '',
            item.description?.trim() || null,
            Number.isFinite(amountNumber) ? amountNumber : 0,
            item.includedInCost ?? true,
            index + 1,
          ],
        );
        const row = result.rows[0];
        if (row) rows.push(row);
      }

      await db.query('commit');
      return NextResponse.json({ ok: true, rows });
    } catch (error) {
      await db.query('rollback');
      throw error;
    }
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unknown sync manual costs error' },
      { status: 500 },
    );
  }
}
