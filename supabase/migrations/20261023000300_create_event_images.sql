-- Create event_images table for event galleries

CREATE TABLE public.event_images (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id     UUID NOT NULL REFERENCES public.events (id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  alt_text     TEXT,
  caption      TEXT,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by   UUID NOT NULL REFERENCES auth.users (id)
);

COMMENT ON TABLE public.event_images IS 'Gallery images attached to a specific event.';

CREATE INDEX idx_event_images_event ON public.event_images (event_id, sort_order);

-- RLS
ALTER TABLE public.event_images ENABLE ROW LEVEL SECURITY;

-- Public: read images for published/completed events
CREATE POLICY event_images_public_select ON public.event_images
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.events e
       WHERE e.id = event_id
         AND e.status IN ('published', 'completed')
    )
  );

-- Organizers (editor+): full CRUD
CREATE POLICY event_images_admin_select ON public.event_images
  FOR SELECT
  USING (public.is_admin('editor'));

CREATE POLICY event_images_admin_insert ON public.event_images
  FOR INSERT
  WITH CHECK (public.is_admin('editor'));

CREATE POLICY event_images_admin_update ON public.event_images
  FOR UPDATE
  USING (public.is_admin('editor'))
  WITH CHECK (public.is_admin('editor'));

CREATE POLICY event_images_admin_delete ON public.event_images
  FOR DELETE
  USING (public.is_admin('editor'));
