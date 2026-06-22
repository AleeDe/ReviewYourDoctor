-- Signup checks, approval-based trials, and billing operations.

alter table public.clinics
  add column if not exists billing_status text not null default 'trial'
    check (billing_status in ('trial', 'paid', 'past_due', 'cancelled')),
  add column if not exists paid_until timestamptz,
  add column if not exists trial_reminder_days integer,
  add column if not exists trial_reminder_sent_at timestamptz;

-- A trial starts when a clinic is approved, not while it waits in the queue.
update public.clinics
set trial_ends_at = null
where is_active = false and approved_at is null;

update public.clinics
set approved_at = coalesce(approved_at, created_at),
    trial_ends_at = coalesce(trial_ends_at, created_at + interval '30 days')
where is_active = true;

-- Called only by the service role from the public signup-check Edge Function.
create or replace function public.is_email_registered(p_email text)
returns boolean
language sql
security definer
set search_path = public, auth
stable
as $$
  select exists (
    select 1 from auth.users where lower(email) = lower(trim(p_email))
  );
$$;

revoke all on function public.is_email_registered(text) from public, anon, authenticated;
grant execute on function public.is_email_registered(text) to service_role;

-- Replace signup RPC so pending clinics do not lose trial days before approval.
create or replace function public.create_my_clinic(
  p_clinic_name text,
  p_slug text,
  p_google_review_url text default null,
  p_manager_email text default null
)
returns public.clinics
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_slug text;
  v_email text;
  v_clinic public.clinics;
begin
  if v_uid is null then raise exception 'not authenticated'; end if;
  if exists (select 1 from public.clinics where owner_user_id = v_uid) then
    raise exception 'you already have a clinic';
  end if;
  if coalesce(trim(p_clinic_name), '') = '' then
    raise exception 'clinic name is required';
  end if;

  v_slug := regexp_replace(lower(trim(coalesce(nullif(p_slug, ''), p_clinic_name))),
                           '[^a-z0-9]+', '-', 'g');
  v_slug := regexp_replace(v_slug, '(^-+|-+$)', '', 'g');
  if v_slug = '' then raise exception 'invalid slug'; end if;
  if exists (select 1 from public.clinics where slug = v_slug) then
    raise exception 'that link name is taken, please choose another';
  end if;

  select email into v_email from auth.users where id = v_uid;
  insert into public.clinics (
    slug, clinic_name, google_review_url, manager_email,
    owner_user_id, is_active, trial_ends_at, billing_status
  ) values (
    v_slug,
    trim(p_clinic_name),
    nullif(trim(coalesce(p_google_review_url, '')), ''),
    coalesce(nullif(trim(coalesce(p_manager_email, '')), ''), v_email),
    v_uid, false, null, 'trial'
  ) returning * into v_clinic;

  return v_clinic;
end;
$$;

revoke all on function public.create_my_clinic(text, text, text, text) from public;
grant execute on function public.create_my_clinic(text, text, text, text) to authenticated;

