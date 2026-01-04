-- 003_seed_demo.sql
-- Seed a demo auth user, profile, project, and plant for local development

-- Demo identifiers (stable UUIDs for local testing)
-- Demo plant: 00000000-0000-0000-0000-000000000001
-- Demo profile: 00000000-0000-0000-0000-000000000010
-- Demo project: 00000000-0000-0000-0000-000000000020

-- Insert a minimal auth user for dev (if not present)
insert into auth.users (id, email, aud, role, email_confirmed_at, created_at)
values (
  '00000000-0000-0000-0000-000000000010',
  'demo@example.local',
  'authenticated',
  'authenticated',
  now(),
  now()
) on conflict (id) do nothing;

-- Insert a matching profile (if not present)
insert into profiles (id, username, display_name, bio, created_at)
values (
  '00000000-0000-0000-0000-000000000010',
  'demo',
  'Demo User',
  'Local seeded demo user',
  now()
) on conflict (id) do nothing;

-- Insert a demo project owned by the demo profile
insert into projects (id, owner, title, description, privacy, created_at)
values (
  '00000000-0000-0000-0000-000000000020',
  '00000000-0000-0000-0000-000000000010',
  'Demo Project',
  'A seeded public demo project for local development',
  'public',
  now()
) on conflict (id) do nothing;

-- Insert a demo plant (deterministic DNA) — uses the simple schema
insert into plants (id, project_id, dna, seed, color, metadata, created_at, growth)
values (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000020',
  jsonb_build_object('axiom','F','rules', jsonb_build_object('F','F[+L]F[-L]F'),'iterations',2,'angle',25,'step',0.4,'scale',0.9,'color','#6b8e23'),
  'demo-seed',
  jsonb_build_object('primary','#6b8e23'),
  jsonb_build_object('demo', true),
  now(),
  0
) on conflict (id) do nothing;

-- Helpful comment
comment on table plants is 'Plant DNA and metadata (seeded demo plant included)';
