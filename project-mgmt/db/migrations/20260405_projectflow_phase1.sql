-- projectflow DB Phase 1 migration
-- Source of truth: MD21 / MD24 / MD25
-- Scope: projects -> project_execution_items -> flow task tables -> live plan tables -> confirmation snapshots
-- Intentionally excludes document copy tables, vendor package tables, and quote cost tables.

create extension if not exists pgcrypto;

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  name text not null,
  client_name text,
  event_date date,
  location text,
  load_in_time text,
  status text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists vendors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  normalized_name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_vendors_normalized_name on vendors (normalized_name);

create table if not exists project_execution_items (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  parent_id uuid references project_execution_items(id) on delete cascade,
  seq_code text not null,
  title text not null,
  size text,
  material text,
  structure text,
  quantity text,
  note text,
  sort_order integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_project_execution_items_project_sort
  on project_execution_items (project_id, sort_order);

create table if not exists design_tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  source_execution_item_id uuid not null references project_execution_items(id) on delete restrict,
  title text not null,
  size text,
  material text,
  structure text,
  quantity text,
  requirement_text text,
  reference_url text,
  status text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_design_tasks_project on design_tasks (project_id);
create index if not exists idx_design_tasks_source_execution_item on design_tasks (source_execution_item_id);

create table if not exists procurement_tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  source_execution_item_id uuid not null references project_execution_items(id) on delete restrict,
  title text not null,
  quantity text,
  budget_note text,
  requirement_text text,
  reference_url text,
  status text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_procurement_tasks_project on procurement_tasks (project_id);
create index if not exists idx_procurement_tasks_source_execution_item on procurement_tasks (source_execution_item_id);

create table if not exists vendor_tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  source_execution_item_id uuid not null references project_execution_items(id) on delete restrict,
  vendor_id uuid not null references vendors(id) on delete restrict,
  title text not null,
  requirement_text text,
  status text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_vendor_tasks_project on vendor_tasks (project_id);
create index if not exists idx_vendor_tasks_vendor on vendor_tasks (vendor_id);
create index if not exists idx_vendor_tasks_project_vendor on vendor_tasks (project_id, vendor_id);
create index if not exists idx_vendor_tasks_source_execution_item on vendor_tasks (source_execution_item_id);

create table if not exists design_task_plans (
  id uuid primary key default gen_random_uuid(),
  design_task_id uuid not null references design_tasks(id) on delete cascade,
  title text not null,
  size text,
  material text,
  structure text,
  quantity text,
  amount numeric(12,2),
  preview_url text,
  vendor_name_text text,
  sort_order integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_design_task_plans_task_sort
  on design_task_plans (design_task_id, sort_order);

create table if not exists procurement_task_plans (
  id uuid primary key default gen_random_uuid(),
  procurement_task_id uuid not null references procurement_tasks(id) on delete cascade,
  title text not null,
  quantity text,
  amount numeric(12,2),
  preview_url text,
  vendor_name_text text,
  sort_order integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_procurement_task_plans_task_sort
  on procurement_task_plans (procurement_task_id, sort_order);

create table if not exists vendor_task_plans (
  id uuid primary key default gen_random_uuid(),
  vendor_task_id uuid not null references vendor_tasks(id) on delete cascade,
  title text not null,
  requirement_text text,
  amount numeric(12,2),
  sort_order integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_vendor_task_plans_task_sort
  on vendor_task_plans (vendor_task_id, sort_order);

create table if not exists task_confirmations (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  flow_type text not null,
  task_id uuid not null,
  confirmation_no integer not null,
  status text not null,
  confirmed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint chk_task_confirmations_flow_type
    check (flow_type in ('design', 'procurement', 'vendor')),
  constraint uq_task_confirmations_flow_task_version
    unique (flow_type, task_id, confirmation_no)
);

create index if not exists idx_task_confirmations_flow_task
  on task_confirmations (flow_type, task_id);

create table if not exists task_confirmation_plan_snapshots (
  id uuid primary key default gen_random_uuid(),
  task_confirmation_id uuid not null references task_confirmations(id) on delete cascade,
  source_plan_id uuid,
  sort_order integer not null,
  payload_json jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_task_confirmation_plan_snapshots_confirmation
  on task_confirmation_plan_snapshots (task_confirmation_id);

create trigger trg_projects_set_updated_at
before update on projects
for each row execute function set_updated_at();

create trigger trg_vendors_set_updated_at
before update on vendors
for each row execute function set_updated_at();

create trigger trg_project_execution_items_set_updated_at
before update on project_execution_items
for each row execute function set_updated_at();

create trigger trg_design_tasks_set_updated_at
before update on design_tasks
for each row execute function set_updated_at();

create trigger trg_procurement_tasks_set_updated_at
before update on procurement_tasks
for each row execute function set_updated_at();

create trigger trg_vendor_tasks_set_updated_at
before update on vendor_tasks
for each row execute function set_updated_at();

create trigger trg_design_task_plans_set_updated_at
before update on design_task_plans
for each row execute function set_updated_at();

create trigger trg_procurement_task_plans_set_updated_at
before update on procurement_task_plans
for each row execute function set_updated_at();

create trigger trg_vendor_task_plans_set_updated_at
before update on vendor_task_plans
for each row execute function set_updated_at();
