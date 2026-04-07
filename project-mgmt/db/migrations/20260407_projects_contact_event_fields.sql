alter table projects
  add column if not exists event_type text,
  add column if not exists contact_name text,
  add column if not exists contact_phone text,
  add column if not exists contact_email text,
  add column if not exists contact_line text;
