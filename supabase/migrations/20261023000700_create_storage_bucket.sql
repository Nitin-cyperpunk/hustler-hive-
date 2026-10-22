-- Create community-media storage bucket and policies.
--
-- Path convention:
--   events/{event-id}/{unique-file-name}.ext
--   projects/{project-id}/{unique-file-name}.ext
--   gallery/{unique-file-name}.ext
--
-- The bucket is PUBLIC for reads (images are served on the public site).
-- Uploads, overwrites, and deletions are restricted to authorized organizers.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'community-media',
  'community-media',
  TRUE,
  10485760,  -- 10 MB
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/svg+xml'
  ]
);

-- Public read access (bucket is public, so objects are readable via URL).
-- This policy allows the API to list/select objects.
CREATE POLICY storage_public_select
  ON storage.objects FOR SELECT
  USING (bucket_id = 'community-media');

-- Organizers (editor+) can upload
CREATE POLICY storage_admin_insert
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'community-media'
    AND public.is_admin('editor')
  );

-- Organizers (editor+) can overwrite their uploads
CREATE POLICY storage_admin_update
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'community-media'
    AND public.is_admin('editor')
  )
  WITH CHECK (
    bucket_id = 'community-media'
    AND public.is_admin('editor')
  );

-- Organizers (admin+) can delete
CREATE POLICY storage_admin_delete
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'community-media'
    AND public.is_admin('admin')
  );
