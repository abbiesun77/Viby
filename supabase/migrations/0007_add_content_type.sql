-- Add content_type and visual_feel to projects for prompt-aware generation
alter table public.projects add column if not exists content_type text;
alter table public.projects add column if not exists visual_feel text;
