insert into categories (name, slug, description)
values
  ('Fridges & Freezers', 'fridges-freezers', 'Cooling appliances for homes, flats, and student accommodation.'),
  ('Sofas & Lounge Sets', 'sofas-lounge-sets', 'Comfortable seating for living rooms and family spaces.'),
  ('Washing Machines', 'washing-machines', 'Front-loader and top-loader washing machines.'),
  ('Beds & Mattresses', 'beds-mattresses', 'Bedroom essentials with budget and premium options.')
on conflict (slug) do nothing;

insert into brands (name, slug, normalized_name)
values
  ('Samsung', 'samsung', 'samsung'),
  ('LG', 'lg', 'lg'),
  ('Defy', 'defy', 'defy'),
  ('Hisense', 'hisense', 'hisense'),
  ('Coricraft', 'coricraft', 'coricraft'),
  ('Sealy', 'sealy', 'sealy')
on conflict (slug) do nothing;

insert into geographies (province, city_or_town, slug, geo_type, is_indexable)
values
  ('South Africa', null, 'south-africa', 'country', true),
  ('Gauteng', null, 'gauteng', 'province', true),
  ('Western Cape', null, 'western-cape', 'province', true),
  ('KwaZulu-Natal', null, 'kwazulu-natal', 'province', true),
  ('Gauteng', 'Johannesburg', 'johannesburg', 'city', true),
  ('Gauteng', 'Pretoria', 'pretoria', 'city', true),
  ('Western Cape', 'Cape Town', 'cape-town', 'city', true),
  ('Western Cape', 'Stellenbosch', 'stellenbosch', 'city', true),
  ('KwaZulu-Natal', 'Durban', 'durban', 'city', true)
on conflict (slug) do nothing;

insert into brand_voice_policies (
  policy_name,
  tone_rules,
  forbidden_phrases,
  preferred_patterns,
  prompt_version,
  is_default
)
values (
  'Well-Kept Default',
  '["Keep sentences short and practical.","Use plain South African English.","Sound warm, clear, and trustworthy.","Prefer helpful guidance over sales pressure."]'::jsonb,
  '["once in a lifetime","luxury experience","revolutionary","best on earth"]'::jsonb,
  '["Good condition. Fair price. Close to home.","Say what the item is, why it helps, and what the next step is.","Use direct calls to action."]'::jsonb,
  '2026-02-28',
  true
)
on conflict do nothing;
