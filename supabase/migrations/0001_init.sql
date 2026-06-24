create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  viby_credit_balance integer not null default 120,
  active_ai_mode text not null default 'viby_ai',
  byok_base_url text,
  byok_api_key_encrypted text,
  created_at timestamptz not null default now()
);

create table public.credit_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  action text not null,
  delta integer not null,
  created_at timestamptz not null default now()
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  raw_input text not null,
  entry_mode text not null check (entry_mode in ('idea', 'paragraph', 'script')),
  current_state text not null default 'brief',
  created_at timestamptz not null default now()
);

create table public.creative_briefs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  unique (project_id),
  payload jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.credit_ledger enable row level security;
alter table public.projects enable row level security;
alter table public.creative_briefs enable row level security;

create policy "Users can read their own profile"
on public.profiles
for select
using (auth.uid() = id);

create policy "Users can update their own profile"
on public.profiles
for update
using (auth.uid() = id);

create policy "Users can read their own credit ledger"
on public.credit_ledger
for select
using (auth.uid() = user_id);

create policy "Users can insert their own credit ledger rows"
on public.credit_ledger
for insert
with check (auth.uid() = user_id);

create policy "Users can read their own projects"
on public.projects
for select
using (auth.uid() = user_id);

create policy "Users can insert their own projects"
on public.projects
for insert
with check (auth.uid() = user_id);

create policy "Users can update their own projects"
on public.projects
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can read briefs for their own projects"
on public.creative_briefs
for select
using (
  exists (
    select 1
    from public.projects
    where public.projects.id = creative_briefs.project_id
      and public.projects.user_id = auth.uid()
  )
);

create policy "Users can insert briefs for their own projects"
on public.creative_briefs
for insert
with check (
  exists (
    select 1
    from public.projects
    where public.projects.id = creative_briefs.project_id
      and public.projects.user_id = auth.uid()
  )
);

create policy "Users can update briefs for their own projects"
on public.creative_briefs
for update
using (
  exists (
    select 1
    from public.projects
    where public.projects.id = creative_briefs.project_id
      and public.projects.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.projects
    where public.projects.id = creative_briefs.project_id
      and public.projects.user_id = auth.uid()
  )
);
