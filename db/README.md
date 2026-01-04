Database migrations and notes for the Collaborative Garden project.

Apply migrations

- Using Supabase CLI (recommended):
  1. Install Supabase CLI: https://supabase.com/docs/guides/cli
  2. Run: `supabase db push` or `supabase db remote set <db-url>` then `supabase db push`.

- Or using psql:
  psql $DATABASE_URL -f db/migrations/001_init.sql

RLS and rate-limits
- The migration enables Row Level Security and adds example policies.
- A helper function `can_interact` enforces a simple 24h limit for 'water' interactions. Add more complex business logic in Postgres or via server functions as needed.

Notes
- The migrations use `gen_random_uuid()`; ensure `pgcrypto` extension is available.
- Adjust policies depending on your desired privacy model (e.g., make profiles private by default).
