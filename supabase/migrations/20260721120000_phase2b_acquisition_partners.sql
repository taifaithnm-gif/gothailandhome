-- Phase 2B additive schema (M3–M4)
-- Acquisition cases + partner RBAC. No destructive Phase 1 changes.

create extension if not exists pgcrypto;

create table if not exists public.acquisition_cases (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'submitted',
  locale text not null default 'en',
  source text not null default 'web_form',
  submitter_name text,
  submitter_email text,
  submitter_phone text,
  marketplace_lead_id uuid references public.marketplace_leads (id) on delete set null,
  customer_user_id uuid references auth.users (id) on delete set null,
  linked_property_id uuid,
  payload jsonb not null default '{}'::jsonb,
  evidence jsonb not null default '{}'::jsonb,
  title_hint text,
  property_type text,
  listing_type text,
  price_text text,
  project_name text,
  bedrooms_text text,
  bathrooms_text text,
  area_text text,
  notes text,
  status_changed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists acquisition_cases_status_idx
  on public.acquisition_cases (status, created_at desc);
create index if not exists acquisition_cases_email_created_idx
  on public.acquisition_cases (submitter_email, created_at desc);

create table if not exists public.acquisition_evidence_items (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.acquisition_cases (id) on delete cascade,
  evidence_id text not null,
  satisfied boolean not null default false,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.acquisition_events (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.acquisition_cases (id) on delete cascade,
  actor_user_id uuid references auth.users (id) on delete set null,
  event_type text not null,
  from_status text,
  to_status text,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists acquisition_events_case_idx
  on public.acquisition_events (case_id, created_at desc);

create table if not exists public.partner_orgs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  kind text not null default 'developer' check (kind in ('developer', 'agency')),
  website text,
  lead_routing_email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.partner_memberships (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.partner_orgs (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('developer', 'agent')),
  status text not null default 'invited'
    check (status in ('invited', 'active', 'suspended', 'revoked')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (org_id, user_id)
);

create table if not exists public.partner_invites (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.partner_orgs (id) on delete cascade,
  email text not null,
  role text not null check (role in ('developer', 'agent')),
  token_hash text not null unique,
  invited_by uuid references auth.users (id) on delete set null,
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'revoked', 'expired')),
  expires_at timestamptz not null,
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.agent_stewardships (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.partner_orgs (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  property_id uuid,
  property_slug text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.partner_lead_handoffs (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.partner_orgs (id) on delete cascade,
  from_user_id uuid references auth.users (id) on delete set null,
  to_user_id uuid references auth.users (id) on delete set null,
  lead_id uuid references public.marketplace_leads (id) on delete set null,
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'declined', 'completed')),
  viewing_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.partner_audit_events (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references public.partner_orgs (id) on delete set null,
  actor_user_id uuid references auth.users (id) on delete set null,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.acquisition_cases enable row level security;
alter table public.acquisition_evidence_items enable row level security;
alter table public.acquisition_events enable row level security;
alter table public.partner_orgs enable row level security;
alter table public.partner_memberships enable row level security;
alter table public.partner_invites enable row level security;
alter table public.agent_stewardships enable row level security;
alter table public.partner_lead_handoffs enable row level security;
alter table public.partner_audit_events enable row level security;

-- Public can insert acquisition cases (intake); reads limited
create policy acquisition_cases_anon_insert
  on public.acquisition_cases for insert
  to anon, authenticated
  with check (true);

create policy acquisition_cases_admin_all
  on public.acquisition_cases for all
  using (public.is_admin())
  with check (public.is_admin());

create policy acquisition_events_admin_all
  on public.acquisition_events for all
  using (public.is_admin())
  with check (public.is_admin());

create policy acquisition_evidence_admin_all
  on public.acquisition_evidence_items for all
  using (public.is_admin())
  with check (public.is_admin());

create policy partner_orgs_member_select
  on public.partner_orgs for select
  using (
    public.is_admin()
    or exists (
      select 1 from public.partner_memberships m
      where m.org_id = partner_orgs.id
        and m.user_id = auth.uid()
        and m.status = 'active'
    )
  );

create policy partner_orgs_member_update
  on public.partner_orgs for update
  using (
    exists (
      select 1 from public.partner_memberships m
      where m.org_id = partner_orgs.id
        and m.user_id = auth.uid()
        and m.status = 'active'
        and m.role = 'developer'
    )
  )
  with check (
    exists (
      select 1 from public.partner_memberships m
      where m.org_id = partner_orgs.id
        and m.user_id = auth.uid()
        and m.status = 'active'
        and m.role = 'developer'
    )
  );

create policy partner_memberships_self_select
  on public.partner_memberships for select
  using (public.is_admin() or user_id = auth.uid());

create policy partner_memberships_admin_all
  on public.partner_memberships for all
  using (public.is_admin())
  with check (public.is_admin());

create policy partner_memberships_self_insert
  on public.partner_memberships for insert
  to authenticated
  with check (user_id = auth.uid());

create policy partner_memberships_self_update
  on public.partner_memberships for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy partner_invites_accept_update
  on public.partner_invites for update
  to authenticated
  using (status = 'pending' and lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')))
  with check (status in ('pending', 'accepted'));

create policy partner_invites_self_select
  on public.partner_invites for select
  to authenticated
  using (lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')) or public.is_admin());


create policy agent_stewardships_member_all
  on public.agent_stewardships for all
  using (
    public.is_admin()
    or (
      user_id = auth.uid()
      and exists (
        select 1 from public.partner_memberships m
        where m.org_id = agent_stewardships.org_id
          and m.user_id = auth.uid()
          and m.status = 'active'
          and m.role = 'agent'
      )
    )
  )
  with check (
    public.is_admin()
    or (
      user_id = auth.uid()
      and exists (
        select 1 from public.partner_memberships m
        where m.org_id = agent_stewardships.org_id
          and m.user_id = auth.uid()
          and m.status = 'active'
          and m.role = 'agent'
      )
    )
  );

create policy partner_lead_handoffs_member_all
  on public.partner_lead_handoffs for all
  using (
    public.is_admin()
    or exists (
      select 1 from public.partner_memberships m
      where m.org_id = partner_lead_handoffs.org_id
        and m.user_id = auth.uid()
        and m.status = 'active'
    )
  )
  with check (
    public.is_admin()
    or exists (
      select 1 from public.partner_memberships m
      where m.org_id = partner_lead_handoffs.org_id
        and m.user_id = auth.uid()
        and m.status = 'active'
    )
  );

create policy partner_audit_admin_all
  on public.partner_audit_events for all
  using (public.is_admin())
  with check (public.is_admin());

create policy partner_audit_member_insert
  on public.partner_audit_events for insert
  to authenticated
  with check (actor_user_id = auth.uid());
