-- Review Your Doctor — public RPCs (callable by the anon role)
--
-- These SECURITY DEFINER functions are the ONLY way anonymous patients touch
-- the database. They expose a minimal, safe surface:
--   * get_clinic_public(slug)  -> public clinic info for the form
--   * submit_feedback(...)      -> log a star rating (+ optional contact)

-- ---------------------------------------------------------------------------
-- get_clinic_public: returns only public fields for an ACTIVE clinic.
-- ---------------------------------------------------------------------------
create or replace function public.get_clinic_public(p_slug text)
returns table (
  slug text,
  clinic_name text,
  google_review_url text
)
language sql
security definer
set search_path = public
stable
as $$
  select c.slug, c.clinic_name, c.google_review_url
  from public.clinics c
  where c.slug = p_slug
    and c.is_active = true;
$$;

-- ---------------------------------------------------------------------------
-- submit_feedback: logs a submission. Derives clinic_id + is_positive
-- server-side. Only stores contact details for negative ratings.
-- Returns the new submission id.
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
  v_is_positive boolean;
  v_id          uuid;
begin
  if p_rating is null or p_rating < 1 or p_rating > 5 then
    raise exception 'invalid rating';
  end if;

  select id into v_clinic_id
  from public.clinics
  where slug = p_slug and is_active = true;

  if v_clinic_id is null then
    raise exception 'clinic not found';
  end if;

  v_is_positive := p_rating >= 4;

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

-- Grant execute to anon + authenticated; revoke from public default.
revoke all on function public.get_clinic_public(text) from public;
revoke all on function public.submit_feedback(text, integer, text, text, text) from public;

grant execute on function public.get_clinic_public(text) to anon, authenticated;
grant execute on function public.submit_feedback(text, integer, text, text, text) to anon, authenticated;
