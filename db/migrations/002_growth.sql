-- 002_growth.sql
-- Add growth column to plants and auto-increment on 'progress' interaction

-- Add growth column (default 0)
alter table plants
  add column if not exists growth integer default 0;

create index if not exists plants_growth_idx on plants(growth desc);

-- Trigger function: when a 'progress' interaction is inserted, increment the plant's growth
create or replace function handle_progress_interaction() returns trigger language plpgsql as $$
begin
  -- Only care about 'progress' interactions
  if (new.kind = 'progress') then
    update plants set growth = coalesce(growth, 0) + 1 where id = new.plant_id;
  end if;
  return new;
end;
$$;

-- Attach trigger to interactions table (after insert)
drop trigger if exists trigger_handle_progress_interaction on interactions;
create trigger trigger_handle_progress_interaction
  after insert on interactions
  for each row
  execute function handle_progress_interaction();

comment on column plants.growth is 'Incrementing integer representing plant growth state (G). Updated via "progress" interactions.';
