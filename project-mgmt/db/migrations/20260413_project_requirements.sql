create table if not exists project_requirements (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  title text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_project_requirements_project_updated
  on project_requirements (project_id, updated_at desc, created_at desc);

create index if not exists idx_project_requirements_project_sort
  on project_requirements (project_id, sort_order asc);
