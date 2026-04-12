create table if not exists financial_quotation_imports (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  file_name text not null,
  imported_at timestamptz not null default now(),
  note text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_financial_quotation_imports_project_imported
  on financial_quotation_imports (project_id, imported_at desc, created_at desc);

create unique index if not exists uq_financial_quotation_imports_active_project
  on financial_quotation_imports (project_id)
  where is_active = true;

create table if not exists financial_quotation_line_items (
  id uuid primary key default gen_random_uuid(),
  quotation_import_id uuid not null references financial_quotation_imports(id) on delete cascade,
  sort_order integer not null default 0,
  category text,
  item_name text not null,
  description text,
  quantity numeric(12,2) not null default 0,
  unit text,
  unit_price numeric(12,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_financial_quotation_line_items_import_sort
  on financial_quotation_line_items (quotation_import_id, sort_order, created_at);

create trigger trg_financial_quotation_imports_set_updated_at
before update on financial_quotation_imports
for each row execute function set_updated_at();

create trigger trg_financial_quotation_line_items_set_updated_at
before update on financial_quotation_line_items
for each row execute function set_updated_at();

with bootstrap_projects as (
  select
    p.id as project_id,
    p.code,
    p.name,
    row_number() over (order by coalesce(p.event_date, current_date), p.created_at, p.id) as project_rank
  from projects p
),
inserted_imports as (
  insert into financial_quotation_imports (
    project_id,
    file_name,
    imported_at,
    note,
    is_active
  )
  select
    bp.project_id,
    concat(lower(replace(coalesce(bp.code, 'quotation'), ' ', '-')), '-quotation-bootstrap.xlsx') as file_name,
    now(),
    'quotation DB-first bootstrap import',
    true
  from bootstrap_projects bp
  where not exists (
    select 1
    from financial_quotation_imports existing
    where existing.project_id = bp.project_id
  )
  returning id, project_id
)
insert into financial_quotation_line_items (
  quotation_import_id,
  sort_order,
  category,
  item_name,
  description,
  quantity,
  unit,
  unit_price
)
select
  ii.id,
  item.sort_order,
  item.category,
  item.item_name,
  item.description,
  item.quantity,
  item.unit,
  item.unit_price
from inserted_imports ii
inner join bootstrap_projects bp on bp.project_id = ii.project_id
cross join lateral (
  values
    (
      1,
      '場佈',
      concat(bp.name, ' / 主視覺與場佈整合'),
      'quotation DB bootstrap line item 1',
      1::numeric,
      '式',
      (120000 + bp.project_rank * 10000)::numeric
    ),
    (
      2,
      '製作',
      concat(bp.name, ' / 製作與輸出執行'),
      'quotation DB bootstrap line item 2',
      1::numeric,
      '式',
      (90000 + bp.project_rank * 8000)::numeric
    ),
    (
      3,
      '備品',
      concat(bp.name, ' / 備品與現場支援'),
      'quotation DB bootstrap line item 3',
      1::numeric,
      '式',
      (45000 + bp.project_rank * 5000)::numeric
    )
) as item(sort_order, category, item_name, description, quantity, unit, unit_price);
