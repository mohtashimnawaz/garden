-- 001_init.sql
-- Initial schema for Collaborative Garden

-- Enable extension for gen_random_uuid()
create extension if not exists pgcrypto;

-- Profiles: linked to Supabase auth.users
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  display_name text,
  bio text,
  avatar_url text,
  metadata jsonb,
  created_at timestamptz default now()
);

create index if not exists profiles_created_at_idx on profiles(created_at);

alter table profiles enable row level security;

-- Allow a user to insert or update their own profile
create policy "Insert own profile" on profiles
  for insert
  with check (auth.uid()::uuid = id);

create policy "Update own profile" on profiles
  for update
  using (auth.uid()::uuid = id)
  with check (auth.uid()::uuid = id);

-- Allow anyone to read profiles (tweak as needed)
create policy "Select profiles" on profiles
  for select
  using (true);


-- Projects: group of plants, owned by a profile
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null references profiles(id) on delete cascade,
  title text not null,
  description text,
  privacy text default 'public', -- public | unlisted | private
  metadata jsonb,
  created_at timestamptz default now()
);

create index if not exists projects_owner_idx on projects(owner);
create index if not exists projects_created_at_idx on projects(created_at);

alter table projects enable row level security;

-- Insert only if the authenticated user is the owner
create policy "Insert project by owner" on projects
  for insert
  with check (auth.uid()::uuid = owner);

-- Allow select if project is public OR you are the owner
create policy "Select public or owner" on projects
  for select
  using (privacy = 'public' OR owner = auth.uid()::uuid);

create policy "Update project by owner" on projects
  for update
  using (owner = auth.uid()::uuid)
  with check (owner = auth.uid()::uuid);

create policy "Delete project by owner" on projects
  for delete
  using (owner = auth.uid()::uuid);


-- Plants: deterministic DNA belongs to a project
create table if not exists plants (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  dna jsonb not null,
  seed text,
  color jsonb,
  metadata jsonb,
  created_at timestamptz default now()
);

create index if not exists plants_project_idx on plants(project_id);
create index if not exists plants_created_at_idx on plants(created_at);

alter table plants enable row level security;

-- Insert plant only if you own the parent project
create policy "Insert plant if project owner" on plants
  for insert
  with check (exists( select 1 from projects p where p.id = project_id and p.owner = auth.uid()::uuid));

-- Select plants if the project is public OR you're the owner
create policy "Select plant public or owner" on plants
  for select
  using (exists (select 1 from projects p where p.id = project_id and (p.privacy = 'public' OR p.owner = auth.uid()::uuid)));

-- Allow project owner to update/delete plants
create policy "Update plant by project owner" on plants
  for update
  using (exists (select 1 from projects p where p.id = project_id and p.owner = auth.uid()::uuid))
  with check (exists (select 1 from projects p where p.id = project_id and p.owner = auth.uid()::uuid));

create policy "Delete plant by project owner" on plants
  for delete
  using (exists (select 1 from projects p where p.id = project_id and p.owner = auth.uid()::uuid));


-- Interactions: likes / watering / comments
create table if not exists interactions (
  id bigserial primary key,
  plant_id uuid not null references plants(id) on delete cascade,
  actor uuid not null references profiles(id) on delete cascade,
  kind text not null, -- e.g. 'like' | 'water' | 'comment'
  payload jsonb,
  created_at timestamptz default now()
);

create index if not exists interactions_plant_idx on interactions(plant_id);
create index if not exists interactions_actor_idx on interactions(actor);
create index if not exists interactions_created_at_idx on interactions(created_at desc);

alter table interactions enable row level security;

-- Helper: allow only one 'water' per actor per plant in 24h; likes may be limited separately
create function can_interact(actor uuid, plant uuid, kind text) returns boolean language sql stable as $$
  select case when kind = 'water' then (
      (select count(1) from interactions where actor = $1 and plant_id = $2 and kind = $3 and created_at > now() - interval '24 hours') = 0
    ) else true end;
$$;

-- Allow authenticated actors to insert interactions if the actor matches and the limit passes
create policy "Insert interaction" on interactions
  for insert
  with check (auth.uid()::uuid = actor and can_interact(actor, plant_id, kind));

-- Allow select on interactions only for owners of the project or if the project is public
create policy "Select interactions if visible" on interactions
  for select
  using (exists (select 1 from plants pl join projects p on p.id = pl.project_id where pl.id = plant_id and (p.privacy = 'public' OR p.owner = auth.uid()::uuid)));

-- Basic housekeeping
comment on table profiles is 'User profiles linked to auth.users';
comment on table projects is 'Projects that group plants, owned by a profile';
comment on table plants is 'Plant DNA and metadata';
comment on table interactions is 'User interactions such as likes, watering, and comments';
