-- Review Your Doctor — V1 schema
-- Tables: clinics, submissions

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- clinics
-- ---------------------------------------------------------------------------
create table if not exists public.clinics (
  id               uuid primary key default gen_random_uuid(),
  slug             text not null unique,
  clinic_name      text not null,
  google_review_url text,
  manager_email    text not null,
  google_place_id  text,
  owner_user_id    uuid references auth.users (id) on delete set null,
  created_at       timestamptz not null default now(),
  trial_ends_at    timestamptz default (now() + interval '30 days'),
  is_active        boolean not null default false
);

comment on table public.clinics is 'One row per onboarded dental clinic.';
comment on column public.clinics.slug is 'Permanent URL identifier, e.g. smile-dental-london';
comment on column public.clinics.owner_user_id is 'Auth user that owns the clinic dashboard login.';

create index if not exists clinics_owner_user_id_idx on public.clinics (owner_user_id);

-- ---------------------------------------------------------------------------
-- submissions
-- ---------------------------------------------------------------------------
create table if not exists public.submissions (
  id          uuid primary key default gen_random_uuid(),
  clinic_id   uuid not null references public.clinics (id) on delete cascade,
  star_rating integer not null check (star_rating between 1 and 5),
  is_positive boolean not null,
  name        text,
  email       text,
  phone       text,
  created_at  timestamptz not null default now()
);

comment on table public.submissions is 'One row per patient star-rating submission.';
comment on column public.submissions.is_positive is 'true when star_rating >= 4.';

create index if not exists submissions_clinic_id_created_at_idx
  on public.submissions (clinic_id, created_at desc);
create index if not exists submissions_clinic_id_is_positive_idx
  on public.submissions (clinic_id, is_positive);
