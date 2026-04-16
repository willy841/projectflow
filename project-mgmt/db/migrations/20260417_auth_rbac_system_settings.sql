create extension if not exists pgcrypto;

create table if not exists system_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  normalized_email text not null unique,
  name text not null,
  role text not null check (role in ('admin', 'member')),
  is_owner boolean not null default false,
  password_hash text,
  must_change_password boolean not null default true,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists auth_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references system_users(id) on delete cascade,
  session_token_hash text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

create index if not exists idx_system_users_role on system_users (role);
create index if not exists idx_system_users_active on system_users (is_active);
create index if not exists idx_auth_sessions_user on auth_sessions (user_id);
create index if not exists idx_auth_sessions_expires_at on auth_sessions (expires_at);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

DROP TRIGGER IF EXISTS trg_system_users_set_updated_at ON system_users;
create trigger trg_system_users_set_updated_at
before update on system_users
for each row execute function set_updated_at();
