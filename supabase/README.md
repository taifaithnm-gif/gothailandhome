# Supabase setup notes for GoThailandHome

## Required environment variables

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_EMAIL=
ADMIN_PASSWORD=
```

## Provisioning options

1. **Vercel Marketplace (preferred)**
   - Accept terms: https://vercel.com/tai-faith-agri-platform-s-projects/~/integrations/accept-terms/supabase?source=cli
   - Then run:
     ```bash
     npx vercel integration add supabase -m region=sin1 --name gothailandhome-db
     npx vercel env pull .env.local
     ```
2. **Management API**
   ```bash
   SUPABASE_ACCESS_TOKEN=... ADMIN_EMAIL=... ADMIN_PASSWORD=... npm run db:provision
   ```

## Apply schema + seed

Run SQL in the Supabase SQL editor (or provision script):

- `supabase/migrations/20260714120000_init_property_foundation.sql`
- `supabase/seed.sql`

Create the admin auth user in Supabase Auth, then insert into `admin_users`.

## Admin

Visit `/admin/login` with the seeded admin credentials.
