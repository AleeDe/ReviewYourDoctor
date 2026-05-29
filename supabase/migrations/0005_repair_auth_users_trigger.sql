-- Repair: "Database error saving new user" / "Database error creating new user"
--
-- Cause: a user-defined trigger on auth.users (commonly a leftover
-- `handle_new_user` from a Supabase quickstart) fails during INSERT, so EVERY
-- new user — via the app, the dashboard "Add user", or "Invite" — fails.
--
-- This app needs NO trigger on auth.users. A clean Supabase project has only
-- INTERNAL triggers there (protected, tgisinternal = true). So it is safe to
-- drop every NON-internal trigger on auth.users — this fixes the problem no
-- matter what the rogue trigger is named.
--
-- Run this whole file once in the Supabase SQL Editor.

-- 1) Show what's currently attached (for your records).
do $$
declare
  r record;
begin
  for r in
    select tgname
    from pg_trigger
    where tgrelid = 'auth.users'::regclass
      and not tgisinternal
  loop
    raise notice 'Dropping user-defined trigger on auth.users: %', r.tgname;
    execute format('drop trigger if exists %I on auth.users;', r.tgname);
  end loop;
end $$;

-- 2) Drop the most common leftover function name (harmless if absent).
drop function if exists public.handle_new_user() cascade;

-- 3) Verify: this should now return ZERO rows.
select tgname, pg_get_triggerdef(oid) as definition
from pg_trigger
where tgrelid = 'auth.users'::regclass
  and not tgisinternal;
