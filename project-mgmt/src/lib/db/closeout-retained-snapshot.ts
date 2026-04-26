import type { CostLineItem, QuoteImportRecord } from '@/components/quote-cost-data';
import type { QuoteCostProjectWithGroups } from '@/lib/db/financial-flow-adapter';
import { createPhase1DbClient } from '@/lib/db/phase1-client';

export type CloseoutRetainedSnapshot = {
  projectId: string;
  quotationTotal: number;
  projectCostTotal: number;
  grossProfit: number;
  quotationImported: boolean;
  quotationImport: QuoteImportRecord | null;
  costItems: CostLineItem[];
  reconciliationGroups: QuoteCostProjectWithGroups['reconciliationGroups'];
  capturedAt: string;
};

type CloseoutSnapshotRow = {
  projectId: string;
  quotationTotal: number | null;
  projectCostTotal: number | null;
  grossProfit: number | null;
  quotationImported: boolean | null;
  quotationImport: QuoteImportRecord | null;
  costItems: CostLineItem[] | null;
  reconciliationGroups: QuoteCostProjectWithGroups['reconciliationGroups'] | null;
  capturedAt: string;
};

const CLOSEOUT_SNAPSHOT_SCHEMA_SQL = `
  create table if not exists financial_closeout_snapshots (
    project_id uuid primary key references projects(id) on delete cascade,
    quotation_total numeric(12,2) not null default 0,
    project_cost_total numeric(12,2) not null default 0,
    gross_profit numeric(12,2) not null default 0,
    quotation_imported boolean not null default false,
    quotation_import jsonb null,
    cost_items jsonb not null default '[]'::jsonb,
    reconciliation_groups jsonb not null default '[]'::jsonb,
    captured_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
  );

  create index if not exists idx_financial_closeout_snapshots_captured_at
    on financial_closeout_snapshots (captured_at desc);
`;

/**
 * Official schema path: db/migrations/20260426_financial_closeout_snapshots.sql
 * Runtime ensure is kept only as a compatibility safeguard for environments that
 * have not applied the formal migration yet.
 */
export async function ensureCloseoutSnapshotTable() {
  const db = createPhase1DbClient();
  await db.query(CLOSEOUT_SNAPSHOT_SCHEMA_SQL);
}

export async function saveCloseoutRetainedSnapshot(project: QuoteCostProjectWithGroups) {
  await ensureCloseoutSnapshotTable();
  const db = createPhase1DbClient();
  const quotationTotal = typeof project.quotationImport?.totalAmount === 'number'
    ? project.quotationImport.totalAmount
    : project.quotationItems.reduce((sum, item) => sum + item.amount, 0);
  const projectCostTotal = project.costItems
    .filter((item) => item.includedInCost)
    .reduce((sum, item) => sum + (item.isManual ? item.adjustedAmount : item.originalAmount), 0);
  const grossProfit = quotationTotal - projectCostTotal;

  await db.query(
    `
      insert into financial_closeout_snapshots (
        project_id,
        quotation_total,
        project_cost_total,
        gross_profit,
        quotation_imported,
        quotation_import,
        cost_items,
        reconciliation_groups,
        captured_at,
        updated_at
      )
      values ($1, $2, $3, $4, $5, $6::jsonb, $7::jsonb, $8::jsonb, now(), now())
      on conflict (project_id)
      do update set
        quotation_total = excluded.quotation_total,
        project_cost_total = excluded.project_cost_total,
        gross_profit = excluded.gross_profit,
        quotation_imported = excluded.quotation_imported,
        quotation_import = excluded.quotation_import,
        cost_items = excluded.cost_items,
        reconciliation_groups = excluded.reconciliation_groups,
        captured_at = excluded.captured_at,
        updated_at = now()
    `,
    [
      project.id,
      quotationTotal,
      projectCostTotal,
      grossProfit,
      project.quotationImported,
      JSON.stringify(project.quotationImport ?? null),
      JSON.stringify(project.costItems ?? []),
      JSON.stringify(project.reconciliationGroups ?? []),
    ],
  );
}

export async function getCloseoutRetainedSnapshot(projectId: string): Promise<CloseoutRetainedSnapshot | null> {
  await ensureCloseoutSnapshotTable();
  const db = createPhase1DbClient();
  const result = await db.query<CloseoutSnapshotRow>(
    `
      select
        project_id as "projectId",
        quotation_total::float8 as "quotationTotal",
        project_cost_total::float8 as "projectCostTotal",
        gross_profit::float8 as "grossProfit",
        quotation_imported as "quotationImported",
        quotation_import as "quotationImport",
        cost_items as "costItems",
        reconciliation_groups as "reconciliationGroups",
        captured_at::text as "capturedAt"
      from financial_closeout_snapshots
      where project_id = $1
      limit 1
    `,
    [projectId],
  );

  const row = result.rows[0];
  if (!row) return null;

  return {
    projectId: row.projectId,
    quotationTotal: Number(row.quotationTotal ?? 0),
    projectCostTotal: Number(row.projectCostTotal ?? 0),
    grossProfit: Number(row.grossProfit ?? 0),
    quotationImported: Boolean(row.quotationImported),
    quotationImport: row.quotationImport ?? null,
    costItems: Array.isArray(row.costItems) ? row.costItems : [],
    reconciliationGroups: Array.isArray(row.reconciliationGroups) ? row.reconciliationGroups : [],
    capturedAt: row.capturedAt,
  };
}
