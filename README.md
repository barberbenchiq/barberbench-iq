# BarberBench IQ

Founder beta of a barber business performance platform built with Next.js, TypeScript, Recharts and optional Supabase authentication.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. The dashboard works immediately in demo mode and saves weekly inputs in local browser storage.

## Supabase setup

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the SQL editor.
3. Copy `.env.example` to `.env.local` and add your project URL and anon key.
4. The included Supabase browser client is ready for the next authentication/database integration step.

## Deploy to Vercel

Import the GitHub repository into Vercel. Framework detection and build settings should be automatic. Add the two Supabase environment variables when live authentication is connected.

## Repository structure

- `app/` routes and styling
- `components/` reusable interface components
- `lib/` calculations, demo data and Supabase client
- `supabase/` database schema
- `public/` web app manifest
