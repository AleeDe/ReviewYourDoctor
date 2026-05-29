-- Review Your Doctor — Row Level Security
--
-- Access model:
--   * Anonymous patients: NO direct table access. They read public clinic info
--     and write submissions only through SECURITY DEFINER functions (0003_rpc).
--   * Authenticated clinic owners: read-only access to THEIR clinic + submissions.
--   * Founder/admin: uses the service-role key (bypasses RLS) in gated server code.

alter table public.clinics    enable row level security;
alter table public.submissions enable row level security;

-- ---- clinics ----
-- Owner can read their own clinic row.
drop policy if exists "clinic owner can read own clinic" on public.clinics;
create policy "clinic owner can read own clinic"
  on public.clinics
  for select
  to authenticated
  using (owner_user_id = (select auth.uid()));

-- ---- submissions ----
-- Owner can read submissions belonging to their clinic.
drop policy if exists "clinic owner can read own submissions" on public.submissions;
create policy "clinic owner can read own submissions"
  on public.submissions
  for select
  to authenticated
  using (
    clinic_id in (
      select id from public.clinics
      where owner_user_id = (select auth.uid())
    )
  );

-- No INSERT/UPDATE/DELETE policies are defined for anon or authenticated roles.
-- Patient writes go exclusively through the submit_feedback() SECURITY DEFINER
-- function. Admin writes use the service-role key.
