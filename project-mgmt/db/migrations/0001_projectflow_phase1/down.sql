begin;

drop trigger if exists trg_vendor_task_plans_set_updated_at on vendor_task_plans;
drop trigger if exists trg_procurement_task_plans_set_updated_at on procurement_task_plans;
drop trigger if exists trg_design_task_plans_set_updated_at on design_task_plans;
drop trigger if exists trg_vendor_tasks_set_updated_at on vendor_tasks;
drop trigger if exists trg_procurement_tasks_set_updated_at on procurement_tasks;
drop trigger if exists trg_design_tasks_set_updated_at on design_tasks;
drop trigger if exists trg_project_execution_items_set_updated_at on project_execution_items;
drop trigger if exists trg_vendors_set_updated_at on vendors;
drop trigger if exists trg_projects_set_updated_at on projects;

drop table if exists task_confirmation_plan_snapshots;
drop table if exists task_confirmations;
drop table if exists vendor_task_plans;
drop table if exists procurement_task_plans;
drop table if exists design_task_plans;
drop table if exists vendor_tasks;
drop table if exists procurement_tasks;
drop table if exists design_tasks;
drop table if exists project_execution_items;
drop table if exists vendors;
drop table if exists projects;

drop function if exists set_updated_at();

commit;
