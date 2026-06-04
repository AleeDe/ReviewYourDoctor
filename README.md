# Review Your Doctor — V1

Reputation management for private UK dental clinics. A QR-linked patient feedback form
routes happy patients to Google reviews and intercepts unhappy ones privately, emailing the
practice manager so a bad public review never gets posted. Each clinic sets its own
**rating threshold** (e.g. 4★ or higher) for who gets sent to Google. Clinics get an
analytics dashboard; the founder gets an admin panel.

Built with **Next.js (App Router) + Supabase + Tailwind + shadcn/ui**, deployable free on
Vercel + Supabase.

---

## Architecture at a glance

| Layer | Tech | Notes |
|---|---|---|
| Frontend | Next.js 16 (App Router), React 19, TypeScript | Vercel hosting |
| Styling | Tailwind v4 + shadcn/ui | |
| Backend | Supabase (Postgres, Auth, Edge Functions) | Cloud |
| Auth | Supabase Auth (email + password) via `@supabase/ssr` | Cookie sessions, `proxy.ts` keeps them fresh |
| Charts | recharts | Dashboard |
| QR codes | `qrcode` + `html-to-image` | Branded poster (logo + ShiftDeploy), download PNG |
| Live rating | Google Places API (Place Details v1) | Server-side, cached 1h |
| Email alerts | Supabase Edge Function + SMTP (denomailer) | Fires on negative submission |
| Animation | Framer Motion | Landing + dashboard micro-motion, reduced-motion aware |
| Logo storage | Supabase Storage (`clinic-logos`, public read) | Owner-scoped write via RLS |

### Routes
- `/` — animated marketing landing
- `/signup` — self-serve business sign-up (creates an **inactive** clinic, pending approval)
- `/[slug]` — public patient star-rating form (only when clinic is approved/active)
- `/[slug]/sorry` — negative (1–3★) private contact capture
- `/[slug]/ty` — generic thank-you
- `/login` — clinic dashboard login
- `/dashboard` — clinic analytics + branded QR + logo upload (auth, owner-scoped)
- `/admin` — founder-only approval queue, onboarding + QR generation
- `/auth/signout` — POST sign-out

### Security model
Anonymous patients never touch tables directly. They call two `SECURITY DEFINER` RPCs:
`get_clinic_public(slug)` and `submit_feedback(...)`. Clinic owners see only their own clinic
and submissions via Row Level Security (`owner_user_id = auth.uid()`). Founder/admin actions
use the service-role key in server actions gated by `ADMIN_EMAILS`.

---

## 1. Prerequisites
- Node.js 20+ (built on 24)
- A Supabase project (free tier)
- (Optional) A Google Cloud project with **Places API (New)** for the dashboard's live
  rating tile. **Not required** to connect a clinic: businesses/admins just paste their
  **Google Maps link** and the app extracts the review/place URL (CID or Place ID) with no API.
- SMTP credentials for the negative-feedback alert email (e.g. Gmail + an App Password, or your own domain SMTP)

## 2. Environment variables
Copy `.env.local.example` to `.env.local` and fill in:

```bash
cp .env.local.example .env.local
```

| Var | Where to get it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | same page (anon public key) |
| `SUPABASE_SERVICE_ROLE_KEY` | same page (service_role — **server only**) |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` in dev; your domain in prod |
| `ADMIN_EMAILS` | comma-separated founder emails allowed into `/admin` |
| `GOOGLE_PLACES_API_KEY` | Google Cloud Console (Places API) |

The `SMTP_*` / `ALERT_FROM_EMAIL` values are **Supabase function secrets**, not Next.js env (see §5).

## 3. Apply the database schema
Run the SQL in `supabase/migrations/` **in order** (0001 → 0007). Either:

**Option A — Supabase SQL Editor:** paste each file's contents and run.

**Option B — Supabase CLI:**
```bash
supabase link --project-ref YOUR_PROJECT_REF
supabase db push          # applies supabase/migrations/*
# optional demo clinic:
supabase db execute --file supabase/seed.sql
```

This creates `clinics` + `submissions`, RLS policies, the public RPCs, the 12-month
retention function, the self-serve signup RPCs (`create_my_clinic`, `update_my_clinic`),
and the `clinic-logos` Storage bucket + policies (0006). `0005` is a one-time repair for a
broken `auth.users` trigger — harmless to run.

### Self-serve signup (pending → approval)
Businesses sign up at `/signup`. The account + clinic are created **inactive**; the patient
form stays hidden until you **Approve & activate** them in `/admin`. For a frictionless trial,
turn **Authentication → Sign In/Up → Confirm email = OFF** (approval is manual anyway). If you
leave email confirmation ON, the business confirms via email, logs in, then finishes creating
their clinic from the dashboard.

### ShiftDeploy logo on the QR poster
Drop your logo at `public/shiftdeploy-logo.svg` — it renders at the bottom of every branded QR
poster. Until the file exists, a "ShiftDeploy" text wordmark is shown as a fallback.

## 4. Run locally
```bash
npm install
npm run dev
```
Visit http://localhost:3000.

- Seed a clinic (run `supabase/seed.sql`) → open `http://localhost:3000/demo-dental`.
- Or create one via `/admin` once you can log in (see below).

### Creating your first admin login
Admin access is gated by `ADMIN_EMAILS`. Create a Supabase Auth user with that email
(Supabase → Authentication → Add user), log in at `/login`, then open `/admin` to onboard
clinics. Each clinic you create gets its own dashboard login automatically.

## 5. Email alerts (Supabase Edge Function + SMTP)
The function in `supabase/functions/send-negative-alert/` emails the manager over SMTP
when a negative submission is inserted (no third-party API — works with Gmail or any host).

```bash
# set secrets (Gmail example — use an App Password, not your normal password)
supabase secrets set \
  SMTP_HOST=smtp.gmail.com \
  SMTP_PORT=465 \
  SMTP_USER=shiftdeploy@gmail.com \
  SMTP_PASS=your-gmail-app-password \
  ALERT_FROM_EMAIL=shiftdeploy@gmail.com
# deploy
supabase functions deploy send-negative-alert --no-verify-jwt
```

Then wire a **Database Webhook** (Supabase → Database → Webhooks):
- Table: `public.submissions`
- Events: **Insert**
- Type: **Supabase Edge Functions** → `send-negative-alert`

The function ignores positive submissions, so the webhook can fire on all inserts.

> **Port:** use `465` for implicit TLS or `587` for STARTTLS. **Gmail:** enable 2-Step
> Verification, then create an **App Password** (Google Account → Security → App passwords)
> and use it as `SMTP_PASS`. For a custom domain, plug in that provider's SMTP host/port/user/pass.

## 6. GDPR / retention
`purge_old_negative_submissions()` deletes negative submissions older than 12 months.
Enable `pg_cron` (Database → Extensions) and schedule it — see the commented snippet in
`supabase/migrations/0004_retention.sql`.

## 7. Deploy to Vercel
1. Push this repo to GitHub and import it in Vercel.
2. Add all env vars from §2 in Vercel → Project → Settings → Environment Variables.
3. Set `NEXT_PUBLIC_SITE_URL` to your production domain (e.g. `https://reviewyourdoctor.co.uk`).
4. Deploy. QR codes encode `NEXT_PUBLIC_SITE_URL/[slug]`, so generate/print posters only
   after the production domain is set.

---

## Onboarding a clinic (founder flow)
1. Log in at `/login` with an `ADMIN_EMAILS` account → go to `/admin`.
2. Fill the **Onboard a new clinic** form (clinic name, Google review URL, manager alert
   email, Google Place ID, and the clinic's dashboard login email + temporary password).
3. Click **Download QR** for that clinic and place it on the printed reception poster.
4. Send the clinic their login details. Done.

## Project structure
```
app/            # routes (patient flow, login, dashboard, admin, signout)
components/     # ui/ (shadcn), patient/, dashboard/, admin/, app-header
lib/supabase/   # browser, server, admin (service role), middleware helper
lib/google/     # places.ts (live rating)
lib/auth.ts     # admin allowlist + current user helpers
supabase/       # migrations/, functions/, config.toml, seed.sql
proxy.ts        # session refresh + route protection
```

## Out of scope (V2)
Twilio SMS, Stripe billing, PowerSync offline, doctor-specific ratings, Doctify,
founder analytics dashboard, mobile app, white-label.
