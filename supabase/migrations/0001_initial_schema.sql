create extension if not exists pgcrypto;

create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique,
  display_name text not null,
  email text unique,
  phone text,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table if not exists user_roles (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  role text not null check (role in ('buyer', 'seller', 'admin', 'super_admin')),
  created_at timestamptz not null default now()
);

create table if not exists brands (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  normalized_name text not null,
  is_active boolean not null default true
);

create table if not exists brand_aliases (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references brands(id) on delete cascade,
  alias text not null unique
);

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text not null
);

create table if not exists category_attributes (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references categories(id) on delete cascade,
  attribute_key text not null,
  attribute_label text not null,
  is_required boolean not null default false
);

create table if not exists geographies (
  id uuid primary key default gen_random_uuid(),
  province text not null,
  district text,
  city_or_town text,
  slug text not null unique,
  geo_type text not null check (geo_type in ('country', 'province', 'city')),
  parent_id uuid references geographies(id) on delete set null,
  is_indexable boolean not null default true
);

create table if not exists seller_profiles (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references profiles(id) on delete cascade,
  business_name text not null,
  slug text not null unique,
  verification_status text not null default 'pending',
  bio text,
  payfast_merchant_ref text,
  accepts_eft boolean not null default true
);

create table if not exists buyer_profiles (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references profiles(id) on delete cascade
);

create table if not exists listings (
  id uuid primary key default gen_random_uuid(),
  seller_profile_id uuid not null references seller_profiles(id) on delete cascade,
  title text not null,
  slug text not null unique,
  description text not null,
  category_id uuid references categories(id),
  brand_id uuid references brands(id),
  model text,
  condition_preference text not null default 'good_used',
  price_amount numeric(12,2) not null,
  reserve_deposit_amount numeric(12,2),
  status text not null default 'pending_review',
  province text not null,
  city_or_town text not null,
  ai_confidence text not null default 'medium',
  created_at timestamptz not null default now()
);

create table if not exists listing_images (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references listings(id) on delete cascade,
  image_url text not null,
  position integer not null default 0
);

create table if not exists listing_attributes (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references listings(id) on delete cascade,
  attribute_key text not null,
  attribute_value text not null
);

create table if not exists buyer_posts (
  id uuid primary key default gen_random_uuid(),
  buyer_profile_id uuid not null references buyer_profiles(id) on delete cascade,
  title text not null,
  description text not null,
  category_id uuid references categories(id),
  brand_id uuid references brands(id),
  budget_min numeric(12,2),
  budget_max numeric(12,2),
  condition_preference text not null default 'any',
  province text not null,
  city_or_town text not null,
  status text not null default 'published',
  ai_confidence text not null default 'medium',
  published_at timestamptz
);

create table if not exists buyer_post_images (
  id uuid primary key default gen_random_uuid(),
  buyer_post_id uuid not null references buyer_posts(id) on delete cascade,
  image_url text not null
);

create table if not exists buyer_post_matches (
  id uuid primary key default gen_random_uuid(),
  buyer_post_id uuid not null references buyer_posts(id) on delete cascade,
  seller_profile_id uuid references seller_profiles(id),
  listing_id uuid references listings(id),
  match_score integer not null,
  match_reason text not null,
  alert_sent_at timestamptz
);

create table if not exists saved_listings (
  id uuid primary key default gen_random_uuid(),
  buyer_profile_id uuid not null references buyer_profiles(id) on delete cascade,
  listing_id uuid not null references listings(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (buyer_profile_id, listing_id)
);

create table if not exists seller_alert_rules (
  id uuid primary key default gen_random_uuid(),
  seller_profile_id uuid not null references seller_profiles(id) on delete cascade,
  category_id uuid references categories(id),
  brand_id uuid references brands(id),
  province text,
  city_or_town text,
  min_match_score integer not null default 60,
  is_active boolean not null default true
);

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  body text not null,
  type text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists enquiries (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references listings(id),
  buyer_profile_id uuid references buyer_profiles(id),
  message text not null,
  created_at timestamptz not null default now()
);

create table if not exists reservations (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references listings(id) on delete cascade,
  buyer_profile_id uuid not null references buyer_profiles(id) on delete cascade,
  status text not null default 'pending_payment',
  payment_method text not null default 'payfast',
  deposit_amount numeric(12,2),
  created_at timestamptz not null default now()
);

create table if not exists reservation_status_history (
  id uuid primary key default gen_random_uuid(),
  reservation_id uuid not null references reservations(id) on delete cascade,
  status text not null,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists payment_transactions (
  id uuid primary key default gen_random_uuid(),
  reservation_id uuid references reservations(id) on delete cascade,
  provider text not null,
  provider_reference text,
  transaction_type text not null,
  amount numeric(12,2),
  currency_code text not null default 'ZAR',
  status text not null,
  raw_payload jsonb,
  created_at timestamptz not null default now()
);

create table if not exists retail_price_reference (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references categories(id),
  brand_id uuid references brands(id),
  amount numeric(12,2),
  currency_code text not null default 'ZAR',
  source text not null,
  confidence text not null default 'medium',
  last_verified_at timestamptz,
  notes text not null
);

create table if not exists seller_documents (
  id uuid primary key default gen_random_uuid(),
  seller_profile_id uuid not null references seller_profiles(id) on delete cascade,
  document_url text not null,
  document_type text not null,
  created_at timestamptz not null default now()
);

create table if not exists cms_pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  body text not null,
  is_published boolean not null default false
);

create table if not exists site_settings (
  id uuid primary key default gen_random_uuid(),
  setting_key text not null unique,
  setting_value jsonb not null
);

create table if not exists brand_voice_policies (
  id uuid primary key default gen_random_uuid(),
  policy_name text not null,
  tone_rules jsonb not null,
  forbidden_phrases jsonb not null,
  preferred_patterns jsonb not null,
  prompt_version text not null,
  is_default boolean not null default false
);

create table if not exists email_events (
  id uuid primary key default gen_random_uuid(),
  recipient text not null,
  subject text not null,
  provider text not null default 'resend',
  status text not null,
  created_at timestamptz not null default now()
);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id),
  entity_type text not null,
  entity_id text not null,
  action text not null,
  payload jsonb,
  created_at timestamptz not null default now()
);
