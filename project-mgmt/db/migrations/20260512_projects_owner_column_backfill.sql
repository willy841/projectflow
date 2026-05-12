alter table if exists projects
  add column if not exists owner text;
