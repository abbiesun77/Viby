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

alter table public.profiles enable row level security;
alter table public.credit_ledger enable row level security;

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
