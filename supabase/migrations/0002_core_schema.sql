-- Task 1: Core content schema for Viby V1
-- Adds scripts, scenes, shots, assets, storyboards.
-- Reconciles the projects table with the V2.2 spec (idea|script + workflow_state).

-- ---------------------------------------------------------------------------
-- projects: align with spec v2.2
-- ---------------------------------------------------------------------------

-- Collapse legacy 'paragraph' entry mode into 'idea' (both走扩写引导路径).
update public.projects set entry_mode = 'idea' where entry_mode = 'paragraph';

alter table public.projects
  drop constraint if exists projects_entry_mode_check;

alter table public.projects
  add constraint projects_entry_mode_check
  check (entry_mode in ('idea', 'script'));

-- Workflow state machine: onboarding → script → scenes → storyboard → done
alter table public.projects
  add column if not exists workflow_state text not null default 'onboarding';

-- Migrate any legacy current_state values into workflow_state.
update public.projects
set workflow_state = case current_state
  when 'brief' then 'script'
  else 'onboarding'
end
where workflow_state = 'onboarding';

alter table public.projects
  add constraint projects_workflow_state_check
  check (workflow_state in ('onboarding','script','scenes','storyboard','done'));

alter table public.projects add column if not exists style text;
alter table public.projects add column if not exists duration text;
alter table public.projects add column if not exists mood text;
alter table public.projects add column if not exists updated_at timestamptz not null default now();

-- ---------------------------------------------------------------------------
-- scripts
-- ---------------------------------------------------------------------------
create table public.scripts (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  content text not null,
  confirmed_at timestamptz,
  created_at timestamptz not null default now()
);
create index scripts_project_id_idx on public.scripts (project_id);

-- ---------------------------------------------------------------------------
-- scenes
-- ---------------------------------------------------------------------------
create table public.scenes (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  scene_number integer not null,
  title text not null,
  created_at timestamptz not null default now()
);
create index scenes_project_id_idx on public.scenes (project_id);

-- ---------------------------------------------------------------------------
-- shots
-- ---------------------------------------------------------------------------
create table public.shots (
  id uuid primary key default gen_random_uuid(),
  scene_id uuid not null references public.scenes(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  shot_number integer not null,
  framing text,
  subject text,
  action text,
  mood text,
  created_at timestamptz not null default now()
);
create index shots_scene_id_idx on public.shots (scene_id);
create index shots_project_id_idx on public.shots (project_id);

-- ---------------------------------------------------------------------------
-- assets
-- ---------------------------------------------------------------------------
create table public.assets (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  asset_type text not null check (asset_type in ('character','scene','prop','style')),
  name text not null,
  description text,
  image_url text,
  status text not null default 'missing' check (status in ('missing','generated','uploaded')),
  priority text not null default 'suggested' check (priority in ('required','suggested')),
  created_at timestamptz not null default now()
);
create index assets_project_id_idx on public.assets (project_id);

-- ---------------------------------------------------------------------------
-- storyboards
-- ---------------------------------------------------------------------------
create table public.storyboards (
  id uuid primary key default gen_random_uuid(),
  scene_id uuid not null references public.scenes(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  grid_size integer not null default 16,
  aspect_ratio text not null default '16:9',
  image_url text,
  prompt text,
  status text not null default 'pending' check (status in ('pending','generating','done','failed')),
  created_at timestamptz not null default now()
);
create index storyboards_scene_id_idx on public.storyboards (scene_id);
create index storyboards_project_id_idx on public.storyboards (project_id);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.scripts      enable row level security;
alter table public.scenes       enable row level security;
alter table public.shots        enable row level security;
alter table public.assets       enable row level security;
alter table public.storyboards  enable row level security;

-- Helper predicate: the row's project belongs to the current user.
create policy "owner_select" on public.scripts for select
  using (project_id in (select id from public.projects where user_id = auth.uid()));
create policy "owner_insert" on public.scripts for insert
  with check (project_id in (select id from public.projects where user_id = auth.uid()));
create policy "owner_update" on public.scripts for update
  using (project_id in (select id from public.projects where user_id = auth.uid()))
  with check (project_id in (select id from public.projects where user_id = auth.uid()));

create policy "owner_select" on public.scenes for select
  using (project_id in (select id from public.projects where user_id = auth.uid()));
create policy "owner_insert" on public.scenes for insert
  with check (project_id in (select id from public.projects where user_id = auth.uid()));
create policy "owner_update" on public.scenes for update
  using (project_id in (select id from public.projects where user_id = auth.uid()))
  with check (project_id in (select id from public.projects where user_id = auth.uid()));
create policy "owner_delete" on public.scenes for delete
  using (project_id in (select id from public.projects where user_id = auth.uid()));

create policy "owner_select" on public.shots for select
  using (project_id in (select id from public.projects where user_id = auth.uid()));
create policy "owner_insert" on public.shots for insert
  with check (project_id in (select id from public.projects where user_id = auth.uid()));
create policy "owner_update" on public.shots for update
  using (project_id in (select id from public.projects where user_id = auth.uid()))
  with check (project_id in (select id from public.projects where user_id = auth.uid()));
create policy "owner_delete" on public.shots for delete
  using (project_id in (select id from public.projects where user_id = auth.uid()));

create policy "owner_select" on public.assets for select
  using (project_id in (select id from public.projects where user_id = auth.uid()));
create policy "owner_insert" on public.assets for insert
  with check (project_id in (select id from public.projects where user_id = auth.uid()));
create policy "owner_update" on public.assets for update
  using (project_id in (select id from public.projects where user_id = auth.uid()))
  with check (project_id in (select id from public.projects where user_id = auth.uid()));
create policy "owner_delete" on public.assets for delete
  using (project_id in (select id from public.projects where user_id = auth.uid()));

create policy "owner_select" on public.storyboards for select
  using (project_id in (select id from public.projects where user_id = auth.uid()));
create policy "owner_insert" on public.storyboards for insert
  with check (project_id in (select id from public.projects where user_id = auth.uid()));
create policy "owner_update" on public.storyboards for update
  using (project_id in (select id from public.projects where user_id = auth.uid()))
  with check (project_id in (select id from public.projects where user_id = auth.uid()));
