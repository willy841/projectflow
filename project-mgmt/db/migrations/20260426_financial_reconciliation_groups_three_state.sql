alter table if exists financial_reconciliation_groups
  drop constraint if exists chk_financial_reconciliation_groups_status;

alter table if exists financial_reconciliation_groups
  add constraint chk_financial_reconciliation_groups_status
  check (reconciliation_status in ('未對帳', '待確認', '已對帳'));
