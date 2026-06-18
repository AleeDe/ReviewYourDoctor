-- Live updates: add tables to the Realtime publication so the dashboard/admin
-- refresh automatically (no manual reload) when feedback or clinics change.

do $$
begin
  alter publication supabase_realtime add table public.submissions;
exception when others then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.clinics;
exception when others then null;
end $$;

-- Realtime delivers only rows the connected user can SELECT (RLS). Clinic
-- owners already see their own submissions/clinic. Add admin read policies so
-- the founder's admin views (incl. the pending queue) update live too.
-- Edit the email list to match your ADMIN_EMAILS.
do $$
begin
  if not exists (select 1 from pg_policies where policyname = 'admins read all clinics' and tablename = 'clinics') then
    create policy "admins read all clinics" on public.clinics for select to authenticated
      using ( lower(auth.jwt() ->> 'email') in ('shiftdeploy@gmail.com', 'contact@shiftdeploy.com') );
  end if;
  if not exists (select 1 from pg_policies where policyname = 'admins read all submissions' and tablename = 'submissions') then
    create policy "admins read all submissions" on public.submissions for select to authenticated
      using ( lower(auth.jwt() ->> 'email') in ('shiftdeploy@gmail.com', 'contact@shiftdeploy.com') );
  end if;
end $$;
