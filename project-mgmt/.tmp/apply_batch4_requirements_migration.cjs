
const { Client } = require("pg");
(async()=>{
  const client = new Client({ connectionString: 'postgresql://postgres.vkjabxekxnnczpulumod:9RnTuDvsNruISgaE@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres' });
  await client.connect();
  await client.query('create table if not exists project_requirements (\n  id uuid primary key default gen_random_uuid(),\n  project_id uuid not null references projects(id) on delete cascade,\n  title text not null,\n  sort_order integer not null default 0,\n  created_at timestamptz not null default now(),\n  updated_at timestamptz not null default now()\n);\n\ncreate index if not exists idx_project_requirements_project_updated\n  on project_requirements (project_id, updated_at desc, created_at desc);\n\ncreate index if not exists idx_project_requirements_project_sort\n  on project_requirements (project_id, sort_order asc);\n');
  console.log("migration applied");
  await client.end();
})().catch(err=>{ console.error(err); process.exit(1); });
