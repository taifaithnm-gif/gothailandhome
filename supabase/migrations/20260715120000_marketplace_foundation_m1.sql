-- Phase 8 M1 — Marketplace Foundation
-- New lead tables only. Does not modify properties, property_listing_sources,
-- listing prices, or inquiry rows.

create type public.marketplace_lead_type as enum (
  'find_home',
  'list_property',
  'viewing_request',
  'developer_partnership',
  'agency_partnership',
  'platform_support'
);

create type public.marketplace_lead_status as enum (
  'new',
  'qualified',
  'assigned',
  'contacted',
  'viewing_scheduled',
  'negotiating',
  'won',
  'lost',
  'spam',
  'archived'
);

create type public.marketplace_review_status as enum (
  'not_applicable',
  'pending_review',
  'approved',
  'rejected'
);

create table public.marketplace_leads (
  id uuid primary key default gen_random_uuid(),
  lead_type public.marketplace_lead_type not null,
  status public.marketplace_lead_status not null default 'new',
  review_status public.marketplace_review_status not null default 'not_applicable',
  source text not null default 'web_form',
  assigned_to text,
  locale text not null default 'en',
  name text,
  email text,
  phone text,
  line_id text,
  whatsapp text,
  message text,
  payload jsonb not null default '{}'::jsonb,
  property_id uuid references public.properties (id) on delete set null,
  project_id uuid references public.property_projects (id) on delete set null,
  consent boolean not null default false,
  consent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint marketplace_leads_consent_required check (consent = true),
  constraint marketplace_leads_list_property_pending check (
    lead_type <> 'list_property'
    or review_status in ('pending_review', 'approved', 'rejected')
  )
);

create table public.marketplace_lead_activities (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.marketplace_leads (id) on delete cascade,
  activity_type text not null,
  note text,
  actor text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index marketplace_leads_type_status_idx
  on public.marketplace_leads (lead_type, status, created_at desc);
create index marketplace_leads_review_idx
  on public.marketplace_leads (review_status, created_at desc)
  where review_status = 'pending_review';
create index marketplace_lead_activities_lead_id_idx
  on public.marketplace_lead_activities (lead_id, created_at desc);

create trigger marketplace_leads_set_updated_at
before update on public.marketplace_leads
for each row
execute function public.set_updated_at();

alter table public.marketplace_leads enable row level security;
alter table public.marketplace_lead_activities enable row level security;

-- Public may create consented leads only (no read of other people's demand).
create policy marketplace_leads_anon_insert
  on public.marketplace_leads
  for insert
  to anon, authenticated
  with check (consent = true);

create policy marketplace_leads_admin_all
  on public.marketplace_leads
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Activity rows are written by trusted insert path (service/admin) or trigger.
create policy marketplace_lead_activities_admin_all
  on public.marketplace_lead_activities
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Auto-log creation activity (BEFORE insert already forces list_property pending_review).
create or replace function public.marketplace_leads_after_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.marketplace_lead_activities (
    lead_id,
    activity_type,
    note,
    actor,
    metadata
  ) values (
    new.id,
    'created',
    'Lead created',
    'system',
    jsonb_build_object(
      'lead_type', new.lead_type,
      'status', new.status,
      'review_status', new.review_status,
      'source', new.source
    )
  );

  return new;
end;
$$;

-- BEFORE INSERT trigger to force review_status for list_property.
create or replace function public.marketplace_leads_before_insert()
returns trigger
language plpgsql
as $$
begin
  if new.lead_type = 'list_property' then
    new.review_status := 'pending_review';
    -- Never auto-publish owner submissions in M1.
    if new.status is null then
      new.status := 'new';
    end if;
  end if;

  if new.consent = true and new.consent_at is null then
    new.consent_at := now();
  end if;

  return new;
end;
$$;

create trigger marketplace_leads_before_insert
before insert on public.marketplace_leads
for each row
execute function public.marketplace_leads_before_insert();

create trigger marketplace_leads_after_insert
after insert on public.marketplace_leads
for each row
execute function public.marketplace_leads_after_insert();

comment on table public.marketplace_leads is
  'Phase 8 M1 private marketplace leads. Demand and owner submissions are never public listings.';
comment on table public.marketplace_lead_activities is
  'Immutable-ish activity history for marketplace leads.';
