-- Projectflow formal DB test data cleanup
-- Usage:
--   psql "$DATABASE_URL" -v project_id='00000000-0000-0000-0000-000000000000' -f db/scripts/projectflow-formal-test-data-cleanup.sql
-- Optional:
--   psql "$DATABASE_URL" -v project_code='PF-TEST-001' -f db/scripts/projectflow-formal-test-data-cleanup.sql
-- Guardrails:
--   1) 預設只接受 project_id 或 project_code 二擇一
--   2) 先 dry-run 看 candidate count，再把 execute_delete 設成 on
--   3) 專門清 project-scoped 正式資料，不碰 vendor_trade_catalog / accounting master data

\set execute_delete off

begin;

create temporary table if not exists _projectflow_cleanup_targets as
select p.id
from projects p
where (
  nullif(:'project_id', '') is not null
  and p.id::text = nullif(:'project_id', '')
) or (
  nullif(:'project_code', '') is not null
  and p.code = nullif(:'project_code', '')
);

-- Preview
select 'target_projects' as scope, count(*)::int as row_count from _projectflow_cleanup_targets;
select p.id, p.code, p.name, coalesce(to_char(p.event_date, 'YYYY-MM-DD'), '-') as event_date
from projects p
inner join _projectflow_cleanup_targets t on t.id = p.id
order by p.created_at desc;

-- Stop here unless caller explicitly flips execute_delete=on.
\if :execute_delete
  delete from task_confirmation_plan_snapshots
  where task_confirmation_id in (
    select tc.id
    from task_confirmations tc
    inner join _projectflow_cleanup_targets t on t.id = tc.project_id
  );

  delete from task_confirmations
  where project_id in (select id from _projectflow_cleanup_targets);

  delete from design_task_plans
  where design_task_id in (
    select dt.id
    from design_tasks dt
    inner join _projectflow_cleanup_targets t on t.id = dt.project_id
  );

  delete from procurement_task_plans
  where procurement_task_id in (
    select pt.id
    from procurement_tasks pt
    inner join _projectflow_cleanup_targets t on t.id = pt.project_id
  );

  delete from vendor_task_plans
  where vendor_task_id in (
    select vt.id
    from vendor_tasks vt
    inner join _projectflow_cleanup_targets t on t.id = vt.project_id
  );

  delete from project_collection_records
  where project_id in (select id from _projectflow_cleanup_targets);

  delete from project_vendor_payment_records
  where project_id in (select id from _projectflow_cleanup_targets);

  delete from financial_manual_costs
  where project_id in (select id from _projectflow_cleanup_targets);

  delete from financial_reconciliation_groups
  where project_id in (select id from _projectflow_cleanup_targets);

  delete from project_requirements
  where project_id in (select id from _projectflow_cleanup_targets);

  delete from design_tasks
  where project_id in (select id from _projectflow_cleanup_targets);

  delete from procurement_tasks
  where project_id in (select id from _projectflow_cleanup_targets);

  delete from vendor_tasks
  where project_id in (select id from _projectflow_cleanup_targets);

  delete from project_execution_items
  where project_id in (select id from _projectflow_cleanup_targets);

  delete from projects
  where id in (select id from _projectflow_cleanup_targets);
\endif

commit;
