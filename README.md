# Collaborative Garden — Starter

This repo is a minimal scaffold for the "Collaborative Garden" slow-social project.

Getting started

1. Install dependencies:
   npm install

2. Add env vars to `.env.local`:
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

3. Run dev server:
   npm run dev

What's included
- Next.js (App Router) + TypeScript
- Tailwind CSS starter
- Minimal R3F scene (`components/GardenScene.tsx`, `components/PlantRenderer.tsx`)
- Stub deterministic L-System generator (`lib/plant-generator.ts`)
- Supabase client (`lib/supabaseClient.ts`)

Next steps
- Design DB migrations for `profiles`, `projects`, `plants`, and `interactions`.
- Implement real-time updates via Supabase Realtime.
- Expand the plant generator to output branch geometry and LOD.
