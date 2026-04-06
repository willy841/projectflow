import { NextResponse } from 'next/server';
import { createPhase1DbClient } from '@/lib/db/phase1-client';

async function ensureFinancialManualCostsTable() {
  const db = createPhase1DbClient();

  await db.query(`
    create table if not exists financial_manual_costs (
      id uuid primary key default gen_random_uuid(),
      project_id uuid not null references projects(id) on delete cascade,
      item_name text not null,
      description text,
      amount numeric(12,2) not null default 0,
      included_in_cost boolean not null default true,
      sort_order integer not null,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `);

  await db.query(`
    create index if not exists idx_financial_manual_costs_project_sort
      on financial_manual_costs (project_id, sort_order)
  `);
}

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

    await ensureFinancialManualCostsTable();
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

    return NextResponse.json({ ok: true, rows });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unknown sync manual costs error' },
      { status: 500 },
    );
  }
}
