# HydroSight — Plans & subscriptions

## Plans

| Plan | Modules | Zones | Bbox max | Period | Quota | PDF/Excel |
|------|---------|-------|----------|--------|-------|-----------|
| **guest** (sans compte) | `lu` | point only | — | 3 months | 2 / jour | No |
| **free** | Land use (`lu`) | point, bbox | 25 km² | 6 months | 10 / mois | No |
| **pro** | gw, sw, lu | + province | — | 36 months | 100 / mois | Yes |
| **premium** | gw, sw, lu | + region, national | — | Unlimited | 500 / mois | Yes |

## One-time Supabase setup

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project → **SQL Editor**.
2. Run: `supabase/migrations/001_plans.sql` and `002_guest_usage.sql`
3. Confirm tables `profiles`, `usage_monthly`, and `guest_usage` exist.

## Backend environment

```env
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_JWT_SECRET=your_jwt_secret
GUEST_JWT_SECRET=optional_separate_secret_for_demo_tokens
```

## Guest (demo) mode

- `POST /auth/guest` — issues a 24h JWT (`role=guest`, `sub=guest:<uuid>`)
- Frontend stores the token in `localStorage` when no Supabase session exists
- `/dashboard` is public; limits are enforced on `/analyse` and `/zones/resolve`

## API

- `POST /auth/guest` — anonymous demo session
- `GET /subscription/me` — plan + usage (Supabase or guest JWT)
- `POST /analyse` — enforces plan; increments usage on success
- `POST /zones/resolve` — enforces zone mode / bbox size

## Change a user's plan (development)

```sql
update public.profiles
set plan = 'pro', plan_expires_at = null
where id = 'USER_UUID_HERE';
```

Valid profile plans: `free`, `pro`, `premium`.

## Frontend

- `/pricing` — plan comparison
- Dashboard — plan badge, guest banner, locked modules/modes, upgrade modal

## Phase 2 (not implemented)

Stripe Checkout + webhooks to update `profiles.plan` automatically.
