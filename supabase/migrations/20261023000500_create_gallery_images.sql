-- Create gallery_images table for community photo gallery

CREATE TABLE public.gallery_images (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  storage_path TEXT NOT NULL,
  alt_text     TEXT,
  caption      TEXT,
  event_id     UUID REFERENCES public.events (id) ON DELETE SET NULL,
  category     TEXT NOT NULL DEFAULT 'general' CHECK (
    category IN ('general', 'event', 'workshop', 'hackathon', 'meetup', 'team')
  ),
  sort_order   INTEGER NOT NULL DEFAULT 0,
  status       TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_by   UUID NOT NULL REFERENCES auth.users (id),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.gallery_images IS 'Community gallery photos — optionally linked to events.';

CREATE INDEX idx_gallery_images_status ON public.gallery_images (status, sort_order);
CREATE INDEX idx_gallery_images_event ON public.gallery_images (event_id) WHERE event_id IS NOT NULL;
CREATE INDEX idx_gallery_images_category ON public.gallery_images (category);

CREATE TRIGGER set_gallery_images_updated_at
  BEFORE UPDATE ON public.gallery_images
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- RLS
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;

-- Public: read published gallery images
CREATE POLICY gallery_images_public_select ON public.gallery_images
  FOR SELECT
  USING (status = 'published');

-- Organizers (editor+): full CRUD
CREATE POLICY gallery_images_admin_select ON public.gallery_images
  FOR SELECT
  USING (public.is_admin('editor'));

CREATE POLICY gallery_images_admin_insert ON public.gallery_images
  FOR INSERT
  WITH CHECK (public.is_admin('editor'));

CREATE POLICY gallery_images_admin_update ON public.gallery_images
  FOR UPDATE
  USING (public.is_admin('editor'))
  WITH CHECK (public.is_admin('editor'));

CREATE POLICY gallery_images_admin_delete ON public.gallery_images
  FOR DELETE
  USING (public.is_admin('editor'));
