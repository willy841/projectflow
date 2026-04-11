create table if not exists financial_reconciliation_groups (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  source_type text not null,
  vendor_name text not null,
  reconciliation_status text not null default '未對帳',
  reconciled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chk_financial_reconciliation_groups_source_type
    check (source_type in ('設計', '備品', '廠商')),
  constraint chk_financial_reconciliation_groups_status
    check (reconciliation_status in ('未對帳', '已對帳')),
  constraint uq_financial_reconciliation_groups_project_source_vendor
    unique (project_id, source_type, vendor_name)
);

create index if not exists idx_financial_reconciliation_groups_project
  on financial_reconciliation_groups (project_id, source_type, vendor_name);

drop trigger if exists trg_financial_reconciliation_groups_set_updated_at on financial_reconciliation_groups;
create trigger trg_financial_reconciliation_groups_set_updated_at
before update on financial_reconciliation_groups
for each row execute function set_updated_at();
