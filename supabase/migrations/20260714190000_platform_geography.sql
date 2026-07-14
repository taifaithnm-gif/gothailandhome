-- Phase 5: Thailand property platform geography + listing taxonomy

create table if not exists public.cities (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name_en text not null,
  name_zh text not null,
  name_th text not null,
  seo_title_en text,
  seo_title_zh text,
  seo_title_th text,
  seo_description_en text,
  seo_description_zh text,
  seo_description_th text,
  summary_en text,
  summary_zh text,
  summary_th text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.districts (
  id uuid primary key default gen_random_uuid(),
  city_id uuid not null references public.cities (id) on delete cascade,
  slug text not null unique,
  name_en text not null,
  name_zh text not null,
  name_th text not null,
  seo_title_en text,
  seo_title_zh text,
  seo_title_th text,
  seo_description_en text,
  seo_description_zh text,
  seo_description_th text,
  summary_en text,
  summary_zh text,
  summary_th text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists districts_city_id_idx on public.districts (city_id);

alter table public.locations
  add column if not exists city_id uuid references public.cities (id) on delete set null,
  add column if not exists district_id uuid references public.districts (id) on delete set null;

alter table public.developers
  add column if not exists seo_title_en text,
  add column if not exists seo_title_zh text,
  add column if not exists seo_title_th text,
  add column if not exists seo_description_en text,
  add column if not exists seo_description_zh text,
  add column if not exists seo_description_th text,
  add column if not exists is_published boolean not null default true;

alter table public.property_projects
  add column if not exists city_id uuid references public.cities (id) on delete set null,
  add column if not exists district_id uuid references public.districts (id) on delete set null,
  add column if not exists transit_tags text[] not null default '{}';

alter table public.properties
  add column if not exists city_id uuid references public.cities (id) on delete set null,
  add column if not exists district_id uuid references public.districts (id) on delete set null,
  add column if not exists transit_tags text[] not null default '{}',
  add column if not exists is_verified_listing boolean not null default false;

create index if not exists locations_city_id_idx on public.locations (city_id);
create index if not exists locations_district_id_idx on public.locations (district_id);
create index if not exists property_projects_city_id_idx on public.property_projects (city_id);
create index if not exists property_projects_district_id_idx on public.property_projects (district_id);
create index if not exists properties_city_id_idx on public.properties (city_id);
create index if not exists properties_district_id_idx on public.properties (district_id);
create index if not exists properties_bedrooms_idx on public.properties (bedrooms);
create index if not exists properties_price_thb_idx on public.properties (price_thb);
create index if not exists properties_transit_tags_idx on public.properties using gin (transit_tags);
create index if not exists property_projects_transit_tags_idx on public.property_projects using gin (transit_tags);

drop trigger if exists cities_set_updated_at on public.cities;
create trigger cities_set_updated_at
before update on public.cities
for each row
execute function public.set_updated_at();

drop trigger if exists districts_set_updated_at on public.districts;
create trigger districts_set_updated_at
before update on public.districts
for each row
execute function public.set_updated_at();

alter table public.cities enable row level security;
alter table public.districts enable row level security;

drop policy if exists "Public read cities" on public.cities;
create policy "Public read cities"
  on public.cities for select
  to anon, authenticated
  using (is_active = true or public.is_admin());

drop policy if exists "Public read districts" on public.districts;
create policy "Public read districts"
  on public.districts for select
  to anon, authenticated
  using (is_active = true or public.is_admin());

drop policy if exists "Admins manage cities" on public.cities;
create policy "Admins manage cities"
  on public.cities for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins manage districts" on public.districts;
create policy "Admins manage districts"
  on public.districts for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Hide Phase 3 placeholder inventory from the public platform (no invented stock)
update public.properties
set status = 'draft'
where listing_url is null
  and (source is null or source = '');

update public.property_projects
set status = 'draft'
where slug in ('river-horizon', 'lagoon-leaf');

update public.developers
set is_published = false
where slug in ('urban-nest', 'palm-ridge', 'northern-abode');
