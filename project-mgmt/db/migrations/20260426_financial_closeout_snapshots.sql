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
