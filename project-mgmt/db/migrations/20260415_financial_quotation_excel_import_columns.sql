alter table if exists financial_quotation_imports
  add column if not exists total_amount numeric(12,2);

alter table if exists financial_quotation_line_items
  add column if not exists line_amount numeric(12,2),
  add column if not exists remark text;

update financial_quotation_line_items
set
  line_amount = coalesce(line_amount, quantity * unit_price),
  remark = coalesce(remark, description)
where line_amount is null or remark is null;

update financial_quotation_imports fqi
set total_amount = totals.total_amount
from (
  select quotation_import_id, coalesce(sum(coalesce(line_amount, quantity * unit_price)), 0)::numeric as total_amount
  from financial_quotation_line_items
  group by quotation_import_id
) totals
where totals.quotation_import_id = fqi.id
  and fqi.total_amount is null;
