alter table if exists design_task_plans
  add column if not exists vendor_id uuid references vendors(id) on delete restrict;

create index if not exists idx_design_task_plans_vendor
  on design_task_plans (vendor_id);

alter table if exists procurement_task_plans
  add column if not exists vendor_id uuid references vendors(id) on delete restrict;

create index if not exists idx_procurement_task_plans_vendor
  on procurement_task_plans (vendor_id);

alter table if exists financial_reconciliation_groups
  add column if not exists vendor_id uuid references vendors(id) on delete restrict;

create index if not exists idx_financial_reconciliation_groups_project_source_vendor_id
  on financial_reconciliation_groups (project_id, source_type, vendor_id);
