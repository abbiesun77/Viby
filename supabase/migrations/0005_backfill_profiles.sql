-- Backfill profiles for any auth users created before the profile trigger
-- existed (e.g. accounts registered during early testing). Without a profile
-- row, projects.user_id -> profiles(id) foreign key fails on insert.
insert into public.profiles (id, email, viby_credit_balance, active_ai_mode)
select u.id, u.email, 120, 'viby_ai'
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null;
