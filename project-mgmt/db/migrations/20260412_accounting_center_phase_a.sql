create table if not exists project_collection_records (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  collected_on date not null,
  amount numeric(12,2) not null check (amount >= 0),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_project_collection_records_project_month
  on project_collection_records (project_id, collected_on desc);

drop trigger if exists trg_project_collection_records_set_updated_at on project_collection_records;
create trigger trg_project_collection_records_set_updated_at
before update on project_collection_records
for each row execute function set_updated_at();

create table if not exists accounting_personnel_employees (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  employee_type text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chk_accounting_personnel_employees_type
    check (employee_type in ('full-time', 'part-time'))
);

create unique index if not exists uq_accounting_personnel_employees_name_type
  on accounting_personnel_employees (name, employee_type);

drop trigger if exists trg_accounting_personnel_employees_set_updated_at on accounting_personnel_employees;
create trigger trg_accounting_personnel_employees_set_updated_at
before update on accounting_personnel_employees
for each row execute function set_updated_at();

create table if not exists accounting_personnel_records (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references accounting_personnel_employees(id) on delete cascade,
  salary_month text not null,
  record_status text not null default 'draft',
  payload_json jsonb not null default '{}'::jsonb,
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chk_accounting_personnel_records_status
    check (record_status in ('draft', 'submitted')),
  constraint chk_accounting_personnel_records_salary_month
    check (salary_month ~ '^[0-9]{4}-[0-9]{2}$')
);

create unique index if not exists uq_accounting_personnel_records_employee_month_status
  on accounting_personnel_records (employee_id, salary_month, record_status);

create index if not exists idx_accounting_personnel_records_month_status
  on accounting_personnel_records (salary_month, record_status);

drop trigger if exists trg_accounting_personnel_records_set_updated_at on accounting_personnel_records;
create trigger trg_accounting_personnel_records_set_updated_at
before update on accounting_personnel_records
for each row execute function set_updated_at();

create table if not exists accounting_office_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_accounting_office_categories_set_updated_at on accounting_office_categories;
create trigger trg_accounting_office_categories_set_updated_at
before update on accounting_office_categories
for each row execute function set_updated_at();

create table if not exists accounting_office_expenses (
  id uuid primary key default gen_random_uuid(),
  expense_month text not null,
  item_name text not null,
  category_id uuid not null references accounting_office_categories(id),
  amount numeric(12,2) not null check (amount >= 0),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chk_accounting_office_expenses_month
    check (expense_month ~ '^[0-9]{4}-[0-9]{2}$')
);

create index if not exists idx_accounting_office_expenses_month
  on accounting_office_expenses (expense_month, created_at desc);

drop trigger if exists trg_accounting_office_expenses_set_updated_at on accounting_office_expenses;
create trigger trg_accounting_office_expenses_set_updated_at
before update on accounting_office_expenses
for each row execute function set_updated_at();

create table if not exists accounting_other_expenses (
  id uuid primary key default gen_random_uuid(),
  expense_month text not null,
  item_name text not null,
  amount numeric(12,2) not null check (amount >= 0),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chk_accounting_other_expenses_month
    check (expense_month ~ '^[0-9]{4}-[0-9]{2}$')
);

create index if not exists idx_accounting_other_expenses_month
  on accounting_other_expenses (expense_month, created_at desc);

drop trigger if exists trg_accounting_other_expenses_set_updated_at on accounting_other_expenses;
create trigger trg_accounting_other_expenses_set_updated_at
before update on accounting_other_expenses
for each row execute function set_updated_at();
