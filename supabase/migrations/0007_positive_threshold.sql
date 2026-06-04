-- Business-configurable "send to Google" threshold.
-- A patient whose star_rating >= positive_threshold is treated as positive
-- (redirected to Google); anything below is captured privately.

alter table public.clinics
  add column if not exists positive_threshold int not null default 4;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'clinics_positive_threshold_chk'
  ) then
    alter table public.clinics
      add constraint clinics_positive_threshold_chk
      check (positive_threshold between 2 and 5);
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- get_clinic_public now returns the threshold (return type change -> drop).
-- ---------------------------------------------------------------------------
drop function if exists public.get_clinic_public(text);

create or replace function public.get_clinic_public(p_slug text)
returns table (
  slug text,
  clinic_name text,
  google_review_url text,
  logo_url text,
  positive_threshold int
)
language sql
security definer
set search_path = public
stable
as $$
  select c.slug, c.clinic_name, c.google_review_url, c.logo_url, c.positive_threshold
  from public.clinics c
  where c.slug = p_slug
    and c.is_active = true;
$$;

revoke all on function public.get_clinic_public(text) from public;
grant execute on function public.get_clinic_public(text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- submit_feedback derives is_positive from the clinic's threshold.
-- ---------------------------------------------------------------------------
create or replace function public.submit_feedback(
  p_slug   text,
  p_rating integer,
  p_name   text default null,
  p_email  text default null,
  p_phone  text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_clinic_id   uuid;
  v_threshold   int;
  v_is_positive boolean;
  v_id          uuid;
begin
  if p_rating is null or p_rating < 1 or p_rating > 5 then
    raise exception 'invalid rating';
  end if;

  select id, positive_threshold
    into v_clinic_id, v_threshold
  from public.clinics
  where slug = p_slug and is_active = true;

  if v_clinic_id is null then
    raise exception 'clinic not found';
  end if;

  v_is_positive := p_rating >= v_threshold;

  insert into public.submissions (clinic_id, star_rating, is_positive, name, email, phone)
  values (
    v_clinic_id,
    p_rating,
    v_is_positive,
    case when v_is_positive then null else nullif(trim(p_name), '') end,
    case when v_is_positive then null else nullif(trim(p_email), '') end,
    case when v_is_positive then null else nullif(trim(p_phone), '') end
  )
  returning id into v_id;

  return v_id;
end;
$$;

revoke all on function public.submit_feedback(text, integer, text, text, text) from public;
grant execute on function public.submit_feedback(text, integer, text, text, text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- update_my_clinic gains p_positive_threshold (signature change -> drop old).
-- ---------------------------------------------------------------------------
drop function if exists public.update_my_clinic(text, text, text, text);

create or replace function public.update_my_clinic(
  p_logo_url           text default null,
  p_google_review_url  text default null,
  p_manager_email      text default null,
  p_google_place_id    text default null,
  p_positive_threshold int default null
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
  if p_positive_threshold is not null
     and (p_positive_threshold < 2 or p_positive_threshold > 5) then
    raise exception 'threshold must be between 2 and 5';
  end if;

  update public.clinics c set
    logo_url           = coalesce(nullif(trim(coalesce(p_logo_url, '')), ''), c.logo_url),
    google_review_url  = coalesce(nullif(trim(coalesce(p_google_review_url, '')), ''), c.google_review_url),
    manager_email      = coalesce(nullif(trim(coalesce(p_manager_email, '')), ''), c.manager_email),
    google_place_id    = coalesce(nullif(trim(coalesce(p_google_place_id, '')), ''), c.google_place_id),
    positive_threshold = coalesce(p_positive_threshold, c.positive_threshold)
  where c.owner_user_id = v_uid
  returning * into v_clinic;

  if v_clinic.id is null then
    raise exception 'no clinic for this user';
  end if;

  return v_clinic;
end;
$$;

revoke all on function public.update_my_clinic(text, text, text, text, int) from public;
grant execute on function public.update_my_clinic(text, text, text, text, int) to authenticated;
