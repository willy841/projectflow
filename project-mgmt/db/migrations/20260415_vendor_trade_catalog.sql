begin;

create table if not exists vendor_trade_catalog (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  normalized_name text not null unique,
  created_at timestamptz not null default now()
);

insert into vendor_trade_catalog (name, normalized_name)
select distinct trimmed.trade_label, lower(trimmed.trade_label)
from (
  select btrim(coalesce(trade_label, '')) as trade_label
  from vendors
) as trimmed
where trimmed.trade_label <> ''
on conflict (name) do nothing;

create index if not exists idx_vendor_trade_catalog_normalized_name
  on vendor_trade_catalog (normalized_name);

commit;
