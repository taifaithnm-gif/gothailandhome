export type ListingType = "sale" | "rent";
export type PropertyType = "condo" | "house" | "villa" | "land" | "commercial";
export type PropertyStatus = "draft" | "published";

type Relationship = {
  foreignKeyName: string;
  columns: string[];
  isOneToOne?: boolean;
  referencedRelation: string;
  referencedColumns: string[];
};

export type LocationRow = {
  id: string;
  slug: string;
  name_en: string;
  name_zh: string;
  name_th: string;
  city_en: string;
  city_zh: string;
  city_th: string;
  province_en: string;
  province_zh: string;
  province_th: string;
  country_code: string;
  city_id: string | null;
  district_id: string | null;
  created_at: string;
};

export type CityRow = {
  id: string;
  slug: string;
  name_en: string;
  name_zh: string;
  name_th: string;
  seo_title_en: string | null;
  seo_title_zh: string | null;
  seo_title_th: string | null;
  seo_description_en: string | null;
  seo_description_zh: string | null;
  seo_description_th: string | null;
  summary_en: string | null;
  summary_zh: string | null;
  summary_th: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type DistrictRow = {
  id: string;
  city_id: string;
  slug: string;
  name_en: string;
  name_zh: string;
  name_th: string;
  seo_title_en: string | null;
  seo_title_zh: string | null;
  seo_title_th: string | null;
  seo_description_en: string | null;
  seo_description_zh: string | null;
  seo_description_th: string | null;
  summary_en: string | null;
  summary_zh: string | null;
  summary_th: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type DeveloperRow = {
  id: string;
  slug: string;
  name_en: string;
  name_zh: string;
  name_th: string;
  website: string | null;
  legal_name_en: string | null;
  legal_name_zh: string | null;
  legal_name_th: string | null;
  description_en: string | null;
  description_zh: string | null;
  description_th: string | null;
  facebook_url: string | null;
  logo_url: string | null;
  phone: string | null;
  email: string | null;
  seo_title_en: string | null;
  seo_title_zh: string | null;
  seo_title_th: string | null;
  seo_description_en: string | null;
  seo_description_zh: string | null;
  seo_description_th: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

export type AgentRow = {
  id: string;
  slug: string;
  name_en: string;
  name_zh: string;
  name_th: string;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  bio_en: string | null;
  bio_zh: string | null;
  bio_th: string | null;
  is_active: boolean;
  created_at: string;
};

export type PropertyProjectRow = {
  id: string;
  developer_id: string | null;
  location_id: string | null;
  slug: string;
  status: PropertyStatus;
  name_en: string;
  name_zh: string;
  name_th: string;
  description_en: string | null;
  description_zh: string | null;
  description_th: string | null;
  address_en: string | null;
  address_zh: string | null;
  address_th: string | null;
  postal_code: string | null;
  latitude: number | null;
  longitude: number | null;
  google_maps_url: string | null;
  official_website: string | null;
  facebook_url: string | null;
  completion_year: number | null;
  total_floors: number | null;
  total_units: number | null;
  building_count: number | null;
  land_area_rai: string | null;
  parking_spaces: number | null;
  ceiling_height_m: number | null;
  common_fee_thb_per_sqm: number | null;
  specifications: Record<string, unknown>;
  unit_types: unknown[];
  facilities: unknown[];
  transportation: unknown[];
  nearby_schools: unknown[];
  nearby_hospitals: unknown[];
  nearby_malls: unknown[];
  faq: unknown[];
  seo_title_en: string | null;
  seo_title_zh: string | null;
  seo_title_th: string | null;
  seo_description_en: string | null;
  seo_description_zh: string | null;
  seo_description_th: string | null;
  og_image_path: string | null;
  hero_image_path: string | null;
  published_at: string | null;
  source_notes: string | null;
  city_id: string | null;
  district_id: string | null;
  transit_tags: string[];
  created_at: string;
  updated_at: string;
};

export type PropertyRow = {
  id: string;
  slug: string;
  status: PropertyStatus;
  listing_type: ListingType;
  property_type: PropertyType;
  project_id: string | null;
  location_id: string;
  agent_id: string | null;
  price_thb: number;
  bedrooms: number | null;
  bathrooms: number | null;
  area_sqm: number | null;
  land_area_sqm: number | null;
  title_en: string;
  title_zh: string;
  title_th: string;
  summary_en: string;
  summary_zh: string;
  summary_th: string;
  description_en: string;
  description_zh: string;
  description_th: string;
  featured: boolean;
  published_at: string | null;
  created_by: string | null;
  source: string | null;
  listing_url: string | null;
  source_updated_at: string | null;
  external_ref: string | null;
  floor_label: string | null;
  building_label: string | null;
  city_id: string | null;
  district_id: string | null;
  transit_tags: string[];
  is_verified_listing: boolean;
  created_at: string;
  updated_at: string;
};

export type PropertyMediaRow = {
  id: string;
  property_id: string;
  storage_path: string;
  public_url: string;
  sort_order: number;
  is_cover: boolean;
  alt_en: string | null;
  alt_zh: string | null;
  alt_th: string | null;
  created_at: string;
};

export type PropertyFeatureRow = {
  id: string;
  property_id: string;
  feature_key: string;
  label_en: string;
  label_zh: string;
  label_th: string;
  value_en: string | null;
  value_zh: string | null;
  value_th: string | null;
  created_at: string;
};

export type AdminUserRow = {
  user_id: string;
  email: string;
  full_name: string | null;
  created_at: string;
};

export type InquiryRow = {
  id: string;
  property_id: string | null;
  project_id: string | null;
  name: string;
  email: string;
  phone: string | null;
  phone_normalized: string | null;
  message: string;
  locale: string;
  status: "new" | "reviewed" | "closed";
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  gclid: string | null;
  fbclid: string | null;
  conversion_event: string | null;
  created_at: string;
};

type TableDef<Row, Insert, Update> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: Relationship[];
};

export type Database = {
  public: {
    Tables: {
      locations: TableDef<
        LocationRow,
        Partial<LocationRow> &
          Pick<
            LocationRow,
            | "slug"
            | "name_en"
            | "name_zh"
            | "name_th"
            | "city_en"
            | "city_zh"
            | "city_th"
            | "province_en"
            | "province_zh"
            | "province_th"
          >,
        Partial<LocationRow>
      >;
      cities: TableDef<
        CityRow,
        Partial<CityRow> &
          Pick<CityRow, "slug" | "name_en" | "name_zh" | "name_th">,
        Partial<CityRow>
      >;
      districts: TableDef<
        DistrictRow,
        Partial<DistrictRow> &
          Pick<
            DistrictRow,
            "city_id" | "slug" | "name_en" | "name_zh" | "name_th"
          >,
        Partial<DistrictRow>
      >;
      developers: TableDef<
        DeveloperRow,
        Partial<DeveloperRow> &
          Pick<DeveloperRow, "slug" | "name_en" | "name_zh" | "name_th">,
        Partial<DeveloperRow>
      >;
      agents: TableDef<
        AgentRow,
        Partial<AgentRow> &
          Pick<AgentRow, "slug" | "name_en" | "name_zh" | "name_th">,
        Partial<AgentRow>
      >;
      property_projects: TableDef<
        PropertyProjectRow,
        Partial<PropertyProjectRow> &
          Pick<PropertyProjectRow, "slug" | "name_en" | "name_zh" | "name_th">,
        Partial<PropertyProjectRow>
      >;
      admin_users: TableDef<
        AdminUserRow,
        Pick<AdminUserRow, "user_id" | "email"> &
          Partial<Pick<AdminUserRow, "full_name">>,
        Partial<AdminUserRow>
      >;
      properties: TableDef<
        PropertyRow,
        Partial<PropertyRow> &
          Pick<
            PropertyRow,
            | "slug"
            | "listing_type"
            | "property_type"
            | "location_id"
            | "price_thb"
            | "title_en"
            | "title_zh"
            | "title_th"
            | "summary_en"
            | "summary_zh"
            | "summary_th"
            | "description_en"
            | "description_zh"
            | "description_th"
          >,
        Partial<PropertyRow>
      >;
      property_media: TableDef<
        PropertyMediaRow,
        Partial<PropertyMediaRow> &
          Pick<PropertyMediaRow, "property_id" | "storage_path" | "public_url">,
        Partial<PropertyMediaRow>
      >;
      property_features: TableDef<
        PropertyFeatureRow,
        Partial<PropertyFeatureRow> &
          Pick<
            PropertyFeatureRow,
            "property_id" | "feature_key" | "label_en" | "label_zh" | "label_th"
          >,
        Partial<PropertyFeatureRow>
      >;
      inquiries: TableDef<
        InquiryRow,
        Partial<InquiryRow> & Pick<InquiryRow, "name" | "email" | "message">,
        Partial<InquiryRow>
      >;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      listing_type: ListingType;
      property_type: PropertyType;
      property_status: PropertyStatus;
      inquiry_status: "new" | "reviewed" | "closed";
    };
    CompositeTypes: Record<string, never>;
  };
};
