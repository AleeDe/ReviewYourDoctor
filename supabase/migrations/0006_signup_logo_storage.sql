-- Phase 2: self-serve signup (pending approval), clinic logos, branded QR.
-- Run after 0001–0005. Safe to re-run (idempotent where practical).

-- ---------------------------------------------------------------------------
-- 1. Clinic columns: uploaded logo + approval timestamp.
-- ---------------------------------------------------------------------------
alter table public.clinics
  add column if not exists logo_url text,
  add column if not exists approved_at timestamptz;

-- ---------------------------------------------------------------------------
-- 2. Public RPC now also returns logo_url (still ACTIVE-only).
--    Drop first: adding a column changes the return row type, which
--    CREATE OR REPLACE cannot do.
-- ---------------------------------------------------------------------------
drop function if exists public.get_clinic_public(text);

create or replace function public.get_clinic_public(p_slug text)
returns table (
  slug text,
  clinic_name text,
  google_review_url text,
  logo_url text
)
language sql
security definer
set search_path = public
stable
as $$
  select c.slug, c.clinic_name, c.google_review_url, c.logo_url
  from public.clinics c
  where c.slug = p_slug
    and c.is_active = true;
$$;

revoke all on function public.get_clinic_public(text) from public;
grant execute on function public.get_clinic_public(text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 3. Self-serve signup: an authenticated user creates ONE clinic for itself,
--    always inactive (founder approves later). SECURITY DEFINER so we control
--    exactly which columns get set.
-- ---------------------------------------------------------------------------
create or replace function public.create_my_clinic(
  p_clinic_name        text,
  p_slug               text,
  p_google_review_url  text default null,
  p_manager_email      text default null
)
returns public.clinics
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid     uuid := auth.uid();
  v_slug    text;
  v_email   text;
  v_clinic  public.clinics;
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;

  if exists (select 1 from public.clinics where owner_user_id = v_uid) then
    raise exception 'you already have a clinic';
  end if;

  if coalesce(trim(p_clinic_name), '') = '' then
    raise exception 'clinic name is required';
  end if;

  -- normalise slug -> lowercase, url-safe
  v_slug := regexp_replace(lower(trim(coalesce(nullif(p_slug, ''), p_clinic_name))),
                           '[^a-z0-9]+', '-', 'g');
  v_slug := regexp_replace(v_slug, '(^-+|-+$)', '', 'g');
  if v_slug = '' then
    raise exception 'invalid slug';
  end if;
  if exists (select 1 from public.clinics where slug = v_slug) then
    raise exception 'that link name is taken, please choose another';
  end if;

  -- manager_email defaults to the signed-in user's email
  select email into v_email from auth.users where id = v_uid;

  insert into public.clinics (
    slug, clinic_name, google_review_url, manager_email,
    owner_user_id, is_active, trial_ends_at
  ) values (
    v_slug,
    trim(p_clinic_name),
    nullif(trim(coalesce(p_google_review_url, '')), ''),
    coalesce(nullif(trim(coalesce(p_manager_email, '')), ''), v_email),
    v_uid,
    false,
    now() + interval '30 days'
  )
  returning * into v_clinic;

  return v_clinic;
end;
$$;

revoke all on function public.create_my_clinic(text, text, text, text) from public;
grant execute on function public.create_my_clinic(text, text, text, text) to authenticated;

-- ---------------------------------------------------------------------------
-- 4. Owner can update safe fields of THEIR clinic only. Never is_active /
--    slug / owner_user_id (those stay founder-controlled).
-- ---------------------------------------------------------------------------
create or replace function public.update_my_clinic(
  p_logo_url           text default null,
  p_google_review_url  text default null,
  p_manager_email      text default null,
  p_google_place_id    text default null
)
returns public.clinics
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid    uuid := auth.uid();
  v_clinic public.clinics;
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;

  update public.clinics c set
    logo_url          = coalesce(nullif(trim(coalesce(p_logo_url, '')), ''), c.logo_url),
    google_review_url = coalesce(nullif(trim(coalesce(p_google_review_url, '')), ''), c.google_review_url),
    manager_email     = coalesce(nullif(trim(coalesce(p_manager_email, '')), ''), c.manager_email),
    google_place_id   = coalesce(nullif(trim(coalesce(p_google_place_id, '')), ''), c.google_place_id)
  where c.owner_user_id = v_uid
  returning * into v_clinic;

  if v_clinic.id is null then
    raise exception 'no clinic for this user';
  end if;

  return v_clinic;
end;
$$;

revoke all on function public.update_my_clinic(text, text, text, text) from public;
grant execute on function public.update_my_clinic(text, text, text, text) to authenticated;

-- ---------------------------------------------------------------------------
-- 5. Storage bucket for clinic logos (public read so the QR poster can load
--    them). Owners may write only under their own clinic id prefix.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('clinic-logos', 'clinic-logos', true)
on conflict (id) do nothing;

drop policy if exists "clinic logos public read" on storage.objects;
create policy "clinic logos public read"
  on storage.objects for select
  using (bucket_id = 'clinic-logos');

drop policy if exists "clinic logos owner write" on storage.objects;
create policy "clinic logos owner write"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'clinic-logos'
    and exists (
      select 1 from public.clinics c
      where c.owner_user_id = auth.uid()
        and c.id::text = (storage.foldername(name))[1]
    )
  );

drop policy if exists "clinic logos owner update" on storage.objects;
create policy "clinic logos owner update"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'clinic-logos'
    and exists (
      select 1 from public.clinics c
      where c.owner_user_id = auth.uid()
        and c.id::text = (storage.foldername(name))[1]
    )
  );

drop policy if exists "clinic logos owner delete" on storage.objects;
create policy "clinic logos owner delete"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'clinic-logos'
    and exists (
      select 1 from public.clinics c
      where c.owner_user_id = auth.uid()
        and c.id::text = (storage.foldername(name))[1]
    )
  );
