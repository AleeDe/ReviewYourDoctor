-- Realtime UPDATE/DELETE events under RLS require the full old/new row so the
-- policy can be evaluated per subscriber. Without REPLICA IDENTITY FULL, an
-- approval (clinics.is_active false -> true) UPDATE was not delivered to the
-- clinic owner, so their dashboard only flipped to "active" after a manual
-- refresh. INSERT events (e.g. new submissions) already carry the full row.

alter table public.clinics replica identity full;
alter table public.submissions replica identity full;
