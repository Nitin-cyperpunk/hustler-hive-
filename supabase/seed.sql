-- Development seed data for Hustlers Hive.
-- These are clearly fictional sample records for local development only.
-- Do NOT run this against a production database.

-- Note: admin_users cannot be seeded without a real auth.users entry.
-- To provision an admin locally:
--   1. Sign up via the local Auth UI at http://localhost:54323
--   2. Then run:
--      INSERT INTO public.admin_users (user_id, role)
--      VALUES ('<your-auth-user-uuid>', 'super_admin');

-- Sample published event
INSERT INTO public.events (id, title, slug, summary, description, location_name, starts_at, ends_at, status, featured, created_by, published_at)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'Dev Sample: Intro to Open Source',
  'dev-intro-to-open-source',
  'A sample event for local development.',
  'This is a development-only seed record. It does not represent a real event.',
  'Sample Venue, Nashik',
  '2026-12-15T10:00:00+05:30',
  '2026-12-15T13:00:00+05:30',
  'published',
  TRUE,
  '00000000-0000-0000-0000-000000000000',
  now()
);

-- Sample draft event
INSERT INTO public.events (id, title, slug, summary, location_name, starts_at, status, created_by)
VALUES (
  'a0000000-0000-0000-0000-000000000002',
  'Dev Sample: Weekend Hackathon',
  'dev-weekend-hackathon',
  'A draft event for testing the admin dashboard.',
  'TBD',
  '2027-01-20T09:00:00+05:30',
  'draft',
  '00000000-0000-0000-0000-000000000000'
);

-- Sample published project
INSERT INTO public.projects (id, title, slug, summary, technologies, status, featured, created_by, published_at)
VALUES (
  'b0000000-0000-0000-0000-000000000001',
  'Dev Sample: Community Website',
  'dev-community-website',
  'A sample project for local development.',
  ARRAY['Next.js', 'TypeScript', 'Supabase'],
  'published',
  TRUE,
  '00000000-0000-0000-0000-000000000000',
  now()
);
