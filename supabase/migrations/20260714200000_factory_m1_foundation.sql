-- Phase 6 M1: Property Factory core foundation (additive only)
-- listing verification enum/column, price history, import batches,
-- source validation + duplicate fingerprint fields.
-- No destructive drops or renames.

-- ---------------------------------------------------------------------------
-- Verification status (keeps existing boolean is_verified_listing)
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'listing_verification_status'
      and n.nspname = 'public'
  ) then
    create type public.listing_verification_status as enum (
      'unverified',
      'verified',
      'stale',
      'delisted'
    );
  end if;
end
$$;

alter table public.properties
  add column if not exists verification_status public.listing_verification_status
    not null default 'unverified';

alter table public.properties
  add column if not exists source_captured_at timestamptz;

alter table public.properties
  add column if not exists source_validated_at timestamptz;

alter table public.properties
  add column if not exists source_validation_ok boolean;

alter table public.properties
  add column if not exists duplicate_fingerprint text;

-- Backfill verification_status from legacy boolean without wiping values
update public.properties
set verification_status = 'verified'
where is_verified_listing = true
  and verification_status = 'unverified';

create index if not exists properties_verification_status_idx
  on public.properties (verification_status);

create index if not exists properties_duplicate_fingerprint_idx
  on public.properties (duplicate_fingerprint)
  where duplicate_fingerprint is not null;

create index if not exists properties_source_captured_at_idx
  on public.properties (source_captured_at);

-- ---------------------------------------------------------------------------
-- Import batch tracking
-- ---------------------------------------------------------------------------
create table if not exists public.import_batches (
  id uuid primary key default gen_random_uuid(),
  batch_key text not null unique,
  source text,
  operator text,
  status text not null default 'planned'
    check (status in ('planned', 'running', 'completed', 'failed', 'rolled_back')),
  package_paths text[] not null default '{}',
  counters jsonb not null default '{}'::jsonb,
  notes text,
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.import_batch_items (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references public.import_batches (id) on delete cascade,
  entity_type text not null
    check (entity_type in ('developer', 'district', 'project', 'listing', 'media')),
  entity_key text not null,
  action text not null
    check (action in ('insert', 'update', 'unchanged', 'skip', 'error')),
  error text,
  payload jsonb,
  created_at timestamptz not null default now()
);

create index if not exists import_batch_items_batch_id_idx
  on public.import_batch_items (batch_id);

create index if not exists import_batch_items_entity_idx
  on public.import_batch_items (entity_type, entity_key);

-- ---------------------------------------------------------------------------
-- Listing price / status history (append-only)
-- ---------------------------------------------------------------------------
create table if not exists public.listing_price_history (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties (id) on delete cascade,
  price_thb numeric(14, 2) not null,
  listing_type public.listing_type not null,
  verification_status public.listing_verification_status,
  source text,
  listing_url text,
  observed_at timestamptz not null default now(),
  batch_id uuid references public.import_batches (id) on delete set null,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists listing_price_history_property_id_idx
  on public.listing_price_history (property_id, observed_at desc);

create index if not exists listing_price_history_batch_id_idx
  on public.listing_price_history (batch_id);

-- ---------------------------------------------------------------------------
-- RLS: ops tables are admin-only (not public catalog)
-- ---------------------------------------------------------------------------
alter table public.import_batches enable row level security;
alter table public.import_batch_items enable row level security;
alter table public.listing_price_history enable row level security;

drop policy if exists "Admins manage import_batches" on public.import_batches;
create policy "Admins manage import_batches"
  on public.import_batches for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins manage import_batch_items" on public.import_batch_items;
create policy "Admins manage import_batch_items"
  on public.import_batch_items for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins manage listing_price_history" on public.listing_price_history;
create policy "Admins manage listing_price_history"
  on public.listing_price_history for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
