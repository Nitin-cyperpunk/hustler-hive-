-- Create events table

CREATE TABLE public.events (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title            TEXT NOT NULL CHECK (char_length(title) >= 1),
  slug             TEXT NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  summary          TEXT,
  description      TEXT,
  cover_image_path TEXT,
  location_name    TEXT,
  starts_at        TIMESTAMPTZ NOT NULL,
  ends_at          TIMESTAMPTZ CHECK (ends_at IS NULL OR ends_at > starts_at),
  registration_url TEXT CHECK (registration_url IS NULL OR registration_url ~ '^https?://'),
  status           TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'completed')),
  featured         BOOLEAN NOT NULL DEFAULT FALSE,
  created_by       UUID NOT NULL REFERENCES auth.users (id),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at     TIMESTAMPTZ
);

COMMENT ON TABLE public.events IS 'Community events — meetups, hackathons, workshops, etc.';

CREATE INDEX idx_events_status ON public.events (status);
CREATE INDEX idx_events_starts_at ON public.events (starts_at DESC);
CREATE INDEX idx_events_featured ON public.events (featured) WHERE featured = TRUE;

CREATE TRIGGER set_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Public: read published and completed events
CREATE POLICY events_public_select ON public.events
  FOR SELECT
  USING (status IN ('published', 'completed'));

-- Organizers (editor+): full CRUD
CREATE POLICY events_admin_select ON public.events
  FOR SELECT
  USING (public.is_admin('editor'));

CREATE POLICY events_admin_insert ON public.events
  FOR INSERT
  WITH CHECK (public.is_admin('editor'));

CREATE POLICY events_admin_update ON public.events
  FOR UPDATE
  USING (public.is_admin('editor'))
  WITH CHECK (public.is_admin('editor'));

CREATE POLICY events_admin_delete ON public.events
  FOR DELETE
  USING (public.is_admin('admin'));
