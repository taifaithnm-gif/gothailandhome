-- Phase 2A additive schema (M1–M2)
-- Does not alter Phase 1 catalog tables destructively.

create extension if not exists pgcrypto;

create table if not exists public.customer_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text,
  display_name text,
  preferred_locale text not null default 'en',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.customer_saved_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  kind text not null check (kind in ('favorite', 'compare')),
  property_id text,
  property_slug text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint customer_saved_items_ident check (
    property_id is not null or property_slug is not null
  )
);

create unique index if not exists customer_saved_items_user_kind_slug_uidx
  on public.customer_saved_items (user_id, kind, property_slug)
  where property_slug is not null;

create table if not exists public.customer_saved_searches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  locale text not null default 'en',
  filters jsonb not null default '{}'::jsonb,
  alert_frequency text not null default 'off'
    check (alert_frequency in ('off', 'instant', 'daily', 'weekly')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists customer_saved_searches_user_idx
  on public.customer_saved_searches (user_id, updated_at desc);

create table if not exists public.customer_notification_prefs (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email_enabled boolean not null default true,
  push_enabled boolean not null default false,
  quiet_hours_start int,
  quiet_hours_end int,
  saved_search_alerts boolean not null default true,
  lead_updates boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.notification_outbox (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  email text,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending'
    check (status in ('pending', 'sent', 'failed', 'dead')),
  attempts int not null default 0,
  last_error text,
  created_at timestamptz not null default now(),
  sent_at timestamptz
);

create index if not exists notification_outbox_pending_idx
  on public.notification_outbox (status, created_at);

create table if not exists public.marketplace_lead_events (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.marketplace_leads (id) on delete cascade,
  actor_user_id uuid references auth.users (id) on delete set null,
  event_type text not null,
  from_status text,
  to_status text,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists marketplace_lead_events_lead_idx
  on public.marketplace_lead_events (lead_id, created_at desc);

alter table public.marketplace_leads
  add column if not exists status_changed_at timestamptz default now();

alter table public.marketplace_leads
  add column if not exists customer_user_id uuid references auth.users (id) on delete set null;

create table if not exists public.crm_sync_deliveries (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.marketplace_leads (id) on delete set null,
  direction text not null check (direction in ('outbound', 'inbound')),
  status text not null default 'pending'
    check (status in ('pending', 'sent', 'failed', 'dead')),
  payload jsonb not null default '{}'::jsonb,
  attempts int not null default 0,
  last_error text,
  created_at timestamptz not null default now(),
  sent_at timestamptz
);

create index if not exists crm_sync_deliveries_status_idx
  on public.crm_sync_deliveries (status, created_at);

alter table public.customer_profiles enable row level security;
alter table public.customer_saved_items enable row level security;
alter table public.customer_saved_searches enable row level security;
alter table public.customer_notification_prefs enable row level security;
alter table public.notification_outbox enable row level security;
alter table public.marketplace_lead_events enable row level security;
alter table public.crm_sync_deliveries enable row level security;

create policy customer_profiles_own
  on public.customer_profiles
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy customer_saved_items_own
  on public.customer_saved_items
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy customer_saved_searches_own
  on public.customer_saved_searches
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy customer_notification_prefs_own
  on public.customer_notification_prefs
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy notification_outbox_own_select
  on public.notification_outbox
  for select
  using (auth.uid() = user_id);

create policy notification_outbox_admin_all
  on public.notification_outbox
  for all
  using (public.is_admin())
  with check (public.is_admin());

create policy marketplace_lead_events_admin_all
  on public.marketplace_lead_events
  for all
  using (public.is_admin())
  with check (public.is_admin());

create policy crm_sync_deliveries_admin_all
  on public.crm_sync_deliveries
  for all
  using (public.is_admin())
  with check (public.is_admin());
