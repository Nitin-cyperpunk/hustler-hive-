-- Create projects table

CREATE TABLE public.projects (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title            TEXT NOT NULL CHECK (char_length(title) >= 1),
  slug             TEXT NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  summary          TEXT,
  description      TEXT,
  repository_url   TEXT CHECK (repository_url IS NULL OR repository_url ~ '^https?://'),
  live_url         TEXT CHECK (live_url IS NULL OR live_url ~ '^https?://'),
  cover_image_path TEXT,
  technologies     TEXT[] NOT NULL DEFAULT '{}',
  status           TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  featured         BOOLEAN NOT NULL DEFAULT FALSE,
  created_by       UUID NOT NULL REFERENCES auth.users (id),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at     TIMESTAMPTZ
);

COMMENT ON TABLE public.projects IS 'Community and member projects.';

CREATE INDEX idx_projects_status ON public.projects (status);
CREATE INDEX idx_projects_featured ON public.projects (featured) WHERE featured = TRUE;

CREATE TRIGGER set_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Public: read published projects
CREATE POLICY projects_public_select ON public.projects
  FOR SELECT
  USING (status = 'published');

-- Organizers (editor+): full CRUD
CREATE POLICY projects_admin_select ON public.projects
  FOR SELECT
  USING (public.is_admin('editor'));

CREATE POLICY projects_admin_insert ON public.projects
  FOR INSERT
  WITH CHECK (public.is_admin('editor'));

CREATE POLICY projects_admin_update ON public.projects
  FOR UPDATE
  USING (public.is_admin('editor'))
  WITH CHECK (public.is_admin('editor'));

CREATE POLICY projects_admin_delete ON public.projects
  FOR DELETE
  USING (public.is_admin('admin'));
