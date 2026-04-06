begin;

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
);

alter table financial_manual_costs
  add column if not exists included_in_cost boolean not null default true;

create index if not exists idx_financial_manual_costs_project_sort
  on financial_manual_costs (project_id, sort_order);

create trigger trg_financial_manual_costs_set_updated_at
before update on financial_manual_costs
for each row execute function set_updated_at();

commit;
