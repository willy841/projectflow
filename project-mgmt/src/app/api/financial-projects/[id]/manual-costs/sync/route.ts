import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createPhase1DbClient } from '@/lib/db/phase1-client';

type TableExistsRow = {
  exists: boolean;
};

type ColumnExistsRow = {
  exists: boolean;
};

async function hasFinancialManualCostsTable() {
  const db = createPhase1DbClient();
  const result = await db.query<TableExistsRow>(`
    select to_regclass('public.financial_manual_costs') is not null as exists
  `);

  return result.rows[0]?.exists ?? false;
}

async function hasFinancialManualCostsIncludedInCostColumn() {
  const db = createPhase1DbClient();
  const result = await db.query<ColumnExistsRow>(`
    select exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'financial_manual_costs'
        and column_name = 'included_in_cost'
    ) as exists
  `);

  return result.rows[0]?.exists ?? false;
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  let projectId: string | null = null;

  try {
    const { id } = await context.params;
    projectId = id;
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

    if (!(await hasFinancialManualCostsTable())) {
      throw new Error('financial_manual_costs table is missing in production database');
    }

    const hasIncludedInCostColumn = await hasFinancialManualCostsIncludedInCostColumn();

    await db.query('begin');

    try {
      await db.query('delete from financial_manual_costs where project_id = $1', [id]);

      const rows: Array<Record<string, unknown>> = [];
      for (const [index, item] of items.entries()) {
        const amountNumber = Number(item.amount ?? 0);
        const result = await db.query(
          hasIncludedInCostColumn
            ? `
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
              `
            : `
                insert into financial_manual_costs (
                  project_id,
                  item_name,
                  description,
                  amount,
                  sort_order
                )
                values ($1, $2, $3, $4, $5)
                returning *, true as included_in_cost
              `,
          hasIncludedInCostColumn
            ? [
                id,
                item.itemName?.trim() ?? '',
                item.description?.trim() || null,
                Number.isFinite(amountNumber) ? amountNumber : 0,
                item.includedInCost ?? true,
                index + 1,
              ]
            : [
                id,
                item.itemName?.trim() ?? '',
                item.description?.trim() || null,
                Number.isFinite(amountNumber) ? amountNumber : 0,
                index + 1,
              ],
        );
        const row = result.rows[0];
        if (row) rows.push(row);
      }

      await db.query('commit');
      revalidatePath('/quote-costs');
      revalidatePath(`/quote-costs/${id}`);
      revalidatePath('/closeouts');
      revalidatePath(`/closeouts/${id}`);
      revalidatePath('/accounting-center');
      return NextResponse.json({ ok: true, rows, hasIncludedInCostColumn });
    } catch (error) {
      await db.query('rollback');
      throw error;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown sync manual costs error';
    console.error('[financial][manual-costs][sync] failed', {
      error: errorMessage,
      projectId,
    });
    return NextResponse.json(
      { ok: false, error: errorMessage },
      { status: 500 },
    );
  }
}
