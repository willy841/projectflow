begin;

alter table vendors
  add column if not exists trade_label text,
  add column if not exists contact_name text,
  add column if not exists phone text,
  add column if not exists email text,
  add column if not exists line_id text,
  add column if not exists address text,
  add column if not exists bank_name text,
  add column if not exists account_name text,
  add column if not exists account_number text,
  add column if not exists labor_name text,
  add column if not exists labor_id_no text,
  add column if not exists labor_birthday_roc text,
  add column if not exists labor_union_membership text;

alter table project_vendor_payment_records
  add column if not exists vendor_id uuid references vendors(id) on delete restrict;

update project_vendor_payment_records p
set vendor_id = v.id
from vendors v
where p.vendor_id is null
  and v.name = p.vendor_name;

create index if not exists idx_vendors_trade_label
  on vendors (trade_label);

create index if not exists idx_project_vendor_payment_records_vendor_id
  on project_vendor_payment_records(vendor_id);

create index if not exists idx_project_vendor_payment_records_project_vendor_id
  on project_vendor_payment_records(project_id, vendor_id);

commit;
