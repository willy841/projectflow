begin;

create table if not exists project_vendor_payment_records (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  vendor_name text not null,
  paid_on date not null,
  amount numeric(12,2) not null check (amount > 0),
  note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_project_vendor_payment_records_project_vendor
  on project_vendor_payment_records(project_id, vendor_name);

commit;
