-- Phase 6 M2 Wave1 hardening + multi-source readiness (additive only)
-- Does NOT drop/rename columns. Does NOT auto-merge duplicates.

-- ---------------------------------------------------------------------------
-- Identity / provenance columns on properties
-- ---------------------------------------------------------------------------
alter table public.properties
  add column if not exists source_listing_id text;

alter table public.properties
  add column if not exists normalized_source_url text;

alter table public.properties
  add column if not exists source_url_hash text;

alter table public.properties
  add column if not exists soft_match_fingerprint text;

alter table public.properties
  add column if not exists last_seen_at timestamptz;

alter table public.properties
  add column if not exists last_verified_at timestamptz;

alter table public.properties
  add column if not exists listing_lifecycle_status text
    not null default 'active'
    check (
      listing_lifecycle_status in (
        'active',
        'inactive',
        'delisted',
        'unknown'
      )
    );

create index if not exists properties_source_listing_id_idx
  on public.properties (source, source_listing_id)
  where source_listing_id is not null;

create unique index if not exists properties_source_source_listing_id_uidx
  on public.properties (source, source_listing_id)
  where source is not null and source_listing_id is not null;

create index if not exists properties_normalized_source_url_idx
  on public.properties (normalized_source_url)
  where normalized_source_url is not null;

create index if not exists properties_source_url_hash_idx
  on public.properties (source_url_hash)
  where source_url_hash is not null;

create index if not exists properties_soft_match_fingerprint_idx
  on public.properties (soft_match_fingerprint)
  where soft_match_fingerprint is not null;

create index if not exists properties_last_seen_at_idx
  on public.properties (last_seen_at);

create index if not exists properties_lifecycle_status_idx
  on public.properties (listing_lifecycle_status);

-- ---------------------------------------------------------------------------
-- Per-source observation rows (one listing can have many sources)
-- Source A must not overwrite source B historical values.
-- ---------------------------------------------------------------------------
create table if not exists public.property_listing_sources (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties (id) on delete cascade,
  source text not null,
  source_listing_id text,
  listing_url text,
  normalized_source_url text,
  source_url_hash text,
  listing_type public.listing_type,
  price_thb numeric(14, 2),
  currency text not null default 'THB',
  verification_status public.listing_verification_status,
  identity_fingerprint text,
  soft_match_fingerprint text,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  last_verified_at timestamptz,
  is_primary boolean not null default false,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists property_listing_sources_source_id_uidx
  on public.property_listing_sources (source, source_listing_id)
  where source_listing_id is not null;

create index if not exists property_listing_sources_property_id_idx
  on public.property_listing_sources (property_id);

create index if not exists property_listing_sources_url_hash_idx
  on public.property_listing_sources (source_url_hash)
  where source_url_hash is not null;

drop trigger if exists property_listing_sources_set_updated_at
  on public.property_listing_sources;
create trigger property_listing_sources_set_updated_at
before update on public.property_listing_sources
for each row
execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Cross-source duplicate candidates (NO automatic merge)
-- ---------------------------------------------------------------------------
create table if not exists public.listing_duplicate_candidates (
  id uuid primary key default gen_random_uuid(),
  property_id_a uuid not null references public.properties (id) on delete cascade,
  property_id_b uuid not null references public.properties (id) on delete cascade,
  match_reason text not null,
  confidence numeric(5, 4),
  evidence jsonb not null default '{}'::jsonb,
  status text not null default 'open'
    check (
      status in (
        'open',
        'confirmed_duplicate',
        'rejected',
        'merged'
      )
    ),
  reviewed_at timestamptz,
  reviewed_by text,
  created_at timestamptz not null default now(),
  check (property_id_a <> property_id_b)
);

create unique index if not exists listing_duplicate_candidates_pair_uidx
  on public.listing_duplicate_candidates (
    least(property_id_a, property_id_b),
    greatest(property_id_a, property_id_b),
    match_reason
  );

create index if not exists listing_duplicate_candidates_status_idx
  on public.listing_duplicate_candidates (status);

-- ---------------------------------------------------------------------------
-- Verification / source events (append-only audit)
-- ---------------------------------------------------------------------------
create table if not exists public.listing_verification_events (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references public.properties (id) on delete set null,
  source text,
  source_listing_id text,
  event_type text not null,
  from_status text,
  to_status text,
  evidence jsonb not null default '{}'::jsonb,
  batch_key text,
  created_at timestamptz not null default now()
);

create index if not exists listing_verification_events_property_id_idx
  on public.listing_verification_events (property_id, created_at desc);

create index if not exists listing_verification_events_source_idx
  on public.listing_verification_events (source, created_at desc);

-- ---------------------------------------------------------------------------
-- Source display priority (lower number = preferred for public fields)
-- Historical per-source prices stay in property_listing_sources / price history.
-- ---------------------------------------------------------------------------
create table if not exists public.listing_source_priority (
  source text primary key,
  priority integer not null,
  notes text,
  updated_at timestamptz not null default now()
);

insert into public.listing_source_priority (source, priority, notes)
values
  ('official', 10, 'Developer / project official portal'),
  ('propertyhub', 20, 'PropertyHub Wave 1 primary harvest'),
  ('manual', 30, 'Ops-verified manual entry'),
  ('other', 90, 'Unclassified source')
on conflict (source) do nothing;

-- ---------------------------------------------------------------------------
-- RLS — ops tables admin-only
-- ---------------------------------------------------------------------------
alter table public.property_listing_sources enable row level security;
alter table public.listing_duplicate_candidates enable row level security;
alter table public.listing_verification_events enable row level security;
alter table public.listing_source_priority enable row level security;

drop policy if exists "Admins manage property_listing_sources"
  on public.property_listing_sources;
create policy "Admins manage property_listing_sources"
  on public.property_listing_sources for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins manage listing_duplicate_candidates"
  on public.listing_duplicate_candidates;
create policy "Admins manage listing_duplicate_candidates"
  on public.listing_duplicate_candidates for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins manage listing_verification_events"
  on public.listing_verification_events;
create policy "Admins manage listing_verification_events"
  on public.listing_verification_events for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Public read listing_source_priority"
  on public.listing_source_priority;
create policy "Public read listing_source_priority"
  on public.listing_source_priority for select
  to anon, authenticated
  using (true);

drop policy if exists "Admins manage listing_source_priority"
  on public.listing_source_priority;
create policy "Admins manage listing_source_priority"
  on public.listing_source_priority for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
