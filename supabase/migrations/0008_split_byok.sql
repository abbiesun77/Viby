-- Split BYOK into separate text / image provider configs
alter table public.profiles add column if not exists byok_image_base_url text;
alter table public.profiles add column if not exists byok_image_api_key  text;
alter table public.profiles add column if not exists byok_text_model     text;
alter table public.profiles add column if not exists byok_image_model    text;
