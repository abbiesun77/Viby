-- =====================================================================
-- apply_to_remote.sql — 补齐本地 0003~0006 迁移到远端 Supabase
-- ---------------------------------------------------------------------
-- 用途：在 Supabase Dashboard → SQL Editor 整段粘贴运行。
-- 特性：完全幂等，无论远端之前跑过哪一步都可安全重复执行。
--
-- 背景：
--   - 远端已确认存在 0001/0002 的表（projects/profiles 等，RLS 正常）。
--   - 本地新增的 0003~0006 可能尚未在远端执行，anon key 无法探测
--     trigger / 约束 / storage bucket，故统一用幂等脚本补齐。
--   - 0006 对当前代码非必需（createProjectSchema.rawInput 强制 min(1)），
--     但跑上以保持 schema 一致、面向未来。
-- =====================================================================

-- ---------------------------------------------------------------------
-- 0003: storage bucket `project-assets` + 策略（幂等化）
-- 原 0003 的 create policy 非幂等，重跑会报 "policy already exists"，
-- 这里用 drop policy if exists 包裹，保证可重复执行。
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('project-assets', 'project-assets', true)
on conflict (id) do nothing;

drop policy if exists "project-assets public read"  on storage.objects;
drop policy if exists "project-assets authed insert" on storage.objects;
drop policy if exists "project-assets authed update" on storage.objects;
drop policy if exists "project-assets authed delete" on storage.objects;

create policy "project-assets public read"
on storage.objects for select
using (bucket_id = 'project-assets');

create policy "project-assets authed insert"
on storage.objects for insert
to authenticated
with check (bucket_id = 'project-assets');

create policy "project-assets authed update"
on storage.objects for update
to authenticated
using (bucket_id = 'project-assets');

create policy "project-assets authed delete"
on storage.objects for delete
to authenticated
using (bucket_id = 'project-assets');

-- ---------------------------------------------------------------------
-- 0004: 新用户注册自动创建 profile（赠送试用 Credit 120）
-- 已幂等：create or replace function + drop trigger if exists。
-- 不跑此 trigger 的后果：新用户注册后 profiles 无行 →
--   resolveAiConfig / debitForAction 读 profile 报错 → idea 模式无法生成剧本。
-- ---------------------------------------------------------------------
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

-- ---------------------------------------------------------------------
-- 0005: 回填历史用户 profile（trigger 存在之前注册的账号）
-- 已幂等：left join ... where is null。
-- ---------------------------------------------------------------------
insert into public.profiles (id, email, viby_credit_balance, active_ai_mode)
select u.id, u.email, 120, 'viby_ai'
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null;

-- ---------------------------------------------------------------------
-- 0006: 放宽 projects.raw_input 非空约束
-- 当前代码 validator 强制 raw_input 非空，此约束非必需；
-- 跑上以保持本地/远端 schema 一致，面向未来（允许 idea 模式不传原文）。
-- 幂等：drop not null 在列已可空时为 no-op。
-- ---------------------------------------------------------------------
alter table public.projects alter column raw_input drop not null;

-- =====================================================================
-- 0007: content_type + visual_feel (2026-06-27)
-- =====================================================================
alter table public.projects add column if not exists content_type text;
alter table public.projects add column if not exists visual_feel text;

-- =====================================================================
-- 0008: split BYOK into text / image providers (2026-06-27)
-- =====================================================================
alter table public.profiles add column if not exists byok_image_base_url text;
alter table public.profiles add column if not exists byok_image_api_key  text;
alter table public.profiles add column if not exists byok_text_model     text;
alter table public.profiles add column if not exists byok_image_model    text;
