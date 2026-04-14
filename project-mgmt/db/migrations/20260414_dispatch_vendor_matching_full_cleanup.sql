alter table design_tasks
  add column if not exists vendor_id uuid references vendors(id) on delete restrict;

alter table procurement_tasks
  add column if not exists vendor_id uuid references vendors(id) on delete restrict;

create index if not exists idx_design_tasks_vendor on design_tasks (vendor_id);
create index if not exists idx_procurement_tasks_vendor on procurement_tasks (vendor_id);
