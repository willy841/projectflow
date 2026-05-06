create table if not exists public.vendor_package_documents (
  id text primary key,
  project_id uuid not null references public.projects(id) on delete cascade,
  vendor_id uuid not null references public.vendors(id) on delete cascade,
  note text,
  document_status text not null default '未生成',
  generated_at timestamptz,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint vendor_package_documents_status_check check (document_status in ('未生成', '已生成', '需更新'))
);

create unique index if not exists vendor_package_documents_project_vendor_idx
  on public.vendor_package_documents(project_id, vendor_id);

create table if not exists public.vendor_package_document_items (
  id uuid primary key default gen_random_uuid(),
  document_id text not null references public.vendor_package_documents(id) on delete cascade,
  vendor_task_id uuid references public.vendor_tasks(id) on delete set null,
  source_snapshot_id uuid references public.task_confirmation_plan_snapshots(id) on delete set null,
  sort_order integer not null default 0,
  item_name text,
  requirement_text text,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists vendor_package_document_items_document_idx
  on public.vendor_package_document_items(document_id, sort_order, created_at);
