-- Review Your Doctor — GDPR data retention
--
-- Negative submissions (which may contain patient contact details) are
-- auto-deleted after 12 months. Positive submissions hold no PII and are kept
-- for analytics/trend history.

create or replace function public.purge_old_negative_submissions()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_deleted integer;
begin
  delete from public.submissions
  where is_positive = false
    and created_at < now() - interval '12 months';
  get diagnostics v_deleted = row_count;
  return v_deleted;
end;
$$;

-- Schedule daily purge via pg_cron (enable the extension in the Supabase
-- dashboard: Database → Extensions → pg_cron). Safe to run repeatedly.
--
-- select cron.schedule(
--   'purge-old-negative-submissions',
--   '0 3 * * *',
--   $$ select public.purge_old_negative_submissions(); $$
-- );
