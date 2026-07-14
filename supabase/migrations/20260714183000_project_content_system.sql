-- Phase 4: Real project content system + listing provenance

alter table public.developers
  add column if not exists legal_name_en text,
  add column if not exists legal_name_zh text,
  add column if not exists legal_name_th text,
  add column if not exists description_en text,
  add column if not exists description_zh text,
  add column if not exists description_th text,
  add column if not exists facebook_url text,
  add column if not exists logo_url text,
  add column if not exists phone text,
  add column if not exists email text,
  add column if not exists updated_at timestamptz not null default now();

alter table public.property_projects
  add column if not exists status public.property_status not null default 'draft',
  add column if not exists address_en text,
  add column if not exists address_zh text,
  add column if not exists address_th text,
  add column if not exists postal_code text,
  add column if not exists latitude numeric(10, 7),
  add column if not exists longitude numeric(10, 7),
  add column if not exists google_maps_url text,
  add column if not exists official_website text,
  add column if not exists facebook_url text,
  add column if not exists completion_year integer,
  add column if not exists total_floors integer,
  add column if not exists total_units integer,
  add column if not exists building_count integer,
  add column if not exists land_area_rai text,
  add column if not exists parking_spaces integer,
  add column if not exists ceiling_height_m numeric(4, 2),
  add column if not exists common_fee_thb_per_sqm numeric(10, 2),
  add column if not exists specifications jsonb not null default '{}'::jsonb,
  add column if not exists unit_types jsonb not null default '[]'::jsonb,
  add column if not exists facilities jsonb not null default '[]'::jsonb,
  add column if not exists transportation jsonb not null default '[]'::jsonb,
  add column if not exists nearby_schools jsonb not null default '[]'::jsonb,
  add column if not exists nearby_hospitals jsonb not null default '[]'::jsonb,
  add column if not exists nearby_malls jsonb not null default '[]'::jsonb,
  add column if not exists faq jsonb not null default '[]'::jsonb,
  add column if not exists seo_title_en text,
  add column if not exists seo_title_zh text,
  add column if not exists seo_title_th text,
  add column if not exists seo_description_en text,
  add column if not exists seo_description_zh text,
  add column if not exists seo_description_th text,
  add column if not exists og_image_path text,
  add column if not exists hero_image_path text,
  add column if not exists published_at timestamptz,
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists source_notes text;

alter table public.properties
  add column if not exists source text,
  add column if not exists listing_url text,
  add column if not exists source_updated_at timestamptz,
  add column if not exists external_ref text,
  add column if not exists floor_label text,
  add column if not exists building_label text;

create unique index if not exists properties_listing_url_uidx
  on public.properties (listing_url)
  where listing_url is not null;

create unique index if not exists properties_external_ref_uidx
  on public.properties (external_ref)
  where external_ref is not null;

alter table public.inquiries
  add column if not exists project_id uuid references public.property_projects (id) on delete set null,
  add column if not exists phone_normalized text,
  add column if not exists utm_source text,
  add column if not exists utm_medium text,
  add column if not exists utm_campaign text,
  add column if not exists utm_content text,
  add column if not exists utm_term text,
  add column if not exists gclid text,
  add column if not exists fbclid text,
  add column if not exists conversion_event text;

create index if not exists property_projects_status_idx
  on public.property_projects (status);

create index if not exists properties_project_id_idx
  on public.properties (project_id);

create index if not exists inquiries_project_id_idx
  on public.inquiries (project_id);

drop trigger if exists developers_set_updated_at on public.developers;
create trigger developers_set_updated_at
before update on public.developers
for each row
execute function public.set_updated_at();

drop trigger if exists property_projects_set_updated_at on public.property_projects;
create trigger property_projects_set_updated_at
before update on public.property_projects
for each row
execute function public.set_updated_at();

drop policy if exists "Public read property projects" on public.property_projects;
drop policy if exists "Public read published property projects" on public.property_projects;
create policy "Public read published property projects"
  on public.property_projects for select
  to anon, authenticated
  using (status = 'published' or public.is_admin());
