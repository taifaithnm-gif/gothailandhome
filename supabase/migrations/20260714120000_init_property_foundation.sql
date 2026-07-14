-- GoThailandHome Phase 3: core property data foundation

create extension if not exists "pgcrypto";

create type public.listing_type as enum ('sale', 'rent');
create type public.property_type as enum (
  'condo',
  'house',
  'villa',
  'land',
  'commercial'
);
create type public.property_status as enum ('draft', 'published');
create type public.inquiry_status as enum ('new', 'reviewed', 'closed');

create table public.locations (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name_en text not null,
  name_zh text not null,
  name_th text not null,
  city_en text not null,
  city_zh text not null,
  city_th text not null,
  province_en text not null,
  province_zh text not null,
  province_th text not null,
  country_code text not null default 'TH',
  created_at timestamptz not null default now()
);

create table public.developers (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name_en text not null,
  name_zh text not null,
  name_th text not null,
  website text,
  created_at timestamptz not null default now()
);

create table public.agents (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name_en text not null,
  name_zh text not null,
  name_th text not null,
  email text,
  phone text,
  avatar_url text,
  bio_en text,
  bio_zh text,
  bio_th text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.property_projects (
  id uuid primary key default gen_random_uuid(),
  developer_id uuid references public.developers (id) on delete set null,
  location_id uuid references public.locations (id) on delete set null,
  slug text not null unique,
  name_en text not null,
  name_zh text not null,
  name_th text not null,
  description_en text,
  description_zh text,
  description_th text,
  created_at timestamptz not null default now()
);

create table public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  full_name text,
  created_at timestamptz not null default now()
);

create table public.properties (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  status public.property_status not null default 'draft',
  listing_type public.listing_type not null,
  property_type public.property_type not null,
  project_id uuid references public.property_projects (id) on delete set null,
  location_id uuid not null references public.locations (id) on delete restrict,
  agent_id uuid references public.agents (id) on delete set null,
  price_thb numeric(14, 2) not null check (price_thb >= 0),
  bedrooms integer check (bedrooms is null or bedrooms >= 0),
  bathrooms numeric(4, 1) check (bathrooms is null or bathrooms >= 0),
  area_sqm numeric(10, 2) check (area_sqm is null or area_sqm >= 0),
  land_area_sqm numeric(12, 2) check (land_area_sqm is null or land_area_sqm >= 0),
  title_en text not null,
  title_zh text not null,
  title_th text not null,
  summary_en text not null,
  summary_zh text not null,
  summary_th text not null,
  description_en text not null,
  description_zh text not null,
  description_th text not null,
  featured boolean not null default false,
  published_at timestamptz,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.property_media (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties (id) on delete cascade,
  storage_path text not null,
  public_url text not null,
  sort_order integer not null default 0,
  is_cover boolean not null default false,
  alt_en text,
  alt_zh text,
  alt_th text,
  created_at timestamptz not null default now()
);

create table public.property_features (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties (id) on delete cascade,
  feature_key text not null,
  label_en text not null,
  label_zh text not null,
  label_th text not null,
  value_en text,
  value_zh text,
  value_th text,
  created_at timestamptz not null default now(),
  unique (property_id, feature_key)
);

create table public.inquiries (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references public.properties (id) on delete set null,
  name text not null,
  email text not null,
  phone text,
  message text not null,
  locale text not null default 'en',
  status public.inquiry_status not null default 'new',
  created_at timestamptz not null default now()
);

create index properties_status_idx on public.properties (status);
create index properties_featured_idx on public.properties (featured) where featured = true;
create index properties_listing_type_idx on public.properties (listing_type);
create index properties_property_type_idx on public.properties (property_type);
create index properties_location_id_idx on public.properties (location_id);
create index property_media_property_id_idx on public.property_media (property_id, sort_order);
create index property_features_property_id_idx on public.property_features (property_id);
create index inquiries_property_id_idx on public.inquiries (property_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger properties_set_updated_at
before update on public.properties
for each row
execute function public.set_updated_at();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
  );
$$;

alter table public.locations enable row level security;
alter table public.developers enable row level security;
alter table public.agents enable row level security;
alter table public.property_projects enable row level security;
alter table public.admin_users enable row level security;
alter table public.properties enable row level security;
alter table public.property_media enable row level security;
alter table public.property_features enable row level security;
alter table public.inquiries enable row level security;

-- Public read policies
create policy "Public read locations"
  on public.locations for select
  to anon, authenticated
  using (true);

create policy "Public read developers"
  on public.developers for select
  to anon, authenticated
  using (true);

create policy "Public read active agents"
  on public.agents for select
  to anon, authenticated
  using (is_active = true or public.is_admin());

create policy "Public read property projects"
  on public.property_projects for select
  to anon, authenticated
  using (true);

create policy "Public read published properties"
  on public.properties for select
  to anon, authenticated
  using (status = 'published' or public.is_admin());

create policy "Public read media for visible properties"
  on public.property_media for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.properties p
      where p.id = property_id
        and (p.status = 'published' or public.is_admin())
    )
  );

create policy "Public read features for visible properties"
  on public.property_features for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.properties p
      where p.id = property_id
        and (p.status = 'published' or public.is_admin())
    )
  );

create policy "Anyone can create inquiries"
  on public.inquiries for insert
  to anon, authenticated
  with check (true);

create policy "Admins read inquiries"
  on public.inquiries for select
  to authenticated
  using (public.is_admin());

create policy "Admins manage admin_users"
  on public.admin_users for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins manage locations"
  on public.locations for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins manage developers"
  on public.developers for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins manage agents"
  on public.agents for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins manage property projects"
  on public.property_projects for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins manage properties"
  on public.properties for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins manage property media"
  on public.property_media for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins manage property features"
  on public.property_features for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins update inquiries"
  on public.inquiries for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

insert into storage.buckets (id, name, public)
values ('property-media', 'property-media', true)
on conflict (id) do nothing;

create policy "Public read property media bucket"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'property-media');

create policy "Admins upload property media"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'property-media' and public.is_admin());

create policy "Admins update property media"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'property-media' and public.is_admin())
  with check (bucket_id = 'property-media' and public.is_admin());

create policy "Admins delete property media"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'property-media' and public.is_admin());
