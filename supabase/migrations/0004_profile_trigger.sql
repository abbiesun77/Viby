-- Auto-create a profile row whenever a new auth user signs up,
-- seeding the trial credit balance. Without this, workspace pages that
-- read profiles.viby_credit_balance have no row to load.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, viby_credit_balance, active_ai_mode)
  values (new.id, new.email, 120, 'viby_ai')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
