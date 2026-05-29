-- Optional seed data for local/dev testing of the patient flow.
-- Creates one active demo clinic. No owner is attached, so the dashboard login
-- won't work for it until you assign owner_user_id via the admin panel.

insert into public.clinics (slug, clinic_name, google_review_url, manager_email, google_place_id, is_active)
values (
  'demo-dental',
  'Demo Dental Practice',
  'https://search.google.com/local/writereview?placeid=ChIJ-demo',
  'shiftdeploy@gmail.com',
  null,
  true
)
on conflict (slug) do nothing;
