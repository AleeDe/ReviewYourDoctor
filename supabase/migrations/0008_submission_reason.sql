-- Capture the reason / comment on negative (below-threshold) submissions.

alter table public.submissions
  add column if not exists reason text;

-- submit_feedback now accepts p_reason (signature change -> drop old first).
drop function if exists public.submit_feedback(text, integer, text, text, text);

create or replace function public.submit_feedback(
  p_slug   text,
  p_rating integer,
  p_name   text default null,
  p_email  text default null,
  p_phone  text default null,
  p_reason text default null
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

  insert into public.submissions (clinic_id, star_rating, is_positive, name, email, phone, reason)
  values (
    v_clinic_id,
    p_rating,
    v_is_positive,
    case when v_is_positive then null else nullif(trim(p_name), '') end,
    case when v_is_positive then null else nullif(trim(p_email), '') end,
    case when v_is_positive then null else nullif(trim(p_phone), '') end,
    case when v_is_positive then null else nullif(trim(p_reason), '') end
  )
  returning id into v_id;

  return v_id;
end;
$$;

revoke all on function public.submit_feedback(text, integer, text, text, text, text) from public;
grant execute on function public.submit_feedback(text, integer, text, text, text, text)
  to anon, authenticated;
