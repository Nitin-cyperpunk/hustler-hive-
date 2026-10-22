-- Create site_settings table for editable website content.
-- Uses a single-row JSONB structure with a known schema, not arbitrary key/value.

CREATE TABLE public.site_settings (
  id         INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  content    JSONB NOT NULL DEFAULT '{
    "community_intro": "",
    "whatsapp_invite_url": "",
    "social_links": {
      "github": "",
      "twitter": "",
      "instagram": "",
      "linkedin": "",
      "youtube": ""
    },
    "featured_event_id": null,
    "announcement": "",
    "seo_title": "Hustlers Hive — Built by students. For students. Run by students.",
    "seo_description": "A student-driven technology community based in Nashik, Maharashtra."
  }'::JSONB,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users (id)
);

COMMENT ON TABLE public.site_settings IS 'Single-row table holding editable website content as validated JSONB. id is always 1.';

-- Validate the JSONB structure on insert/update
CREATE OR REPLACE FUNCTION public.validate_site_settings()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Ensure required top-level keys exist
  IF NOT (
    NEW.content ? 'community_intro' AND
    NEW.content ? 'social_links' AND
    NEW.content ? 'seo_title' AND
    NEW.content ? 'seo_description'
  ) THEN
    RAISE EXCEPTION 'site_settings content must include: community_intro, social_links, seo_title, seo_description';
  END IF;

  -- Validate social_links is an object
  IF jsonb_typeof(NEW.content -> 'social_links') <> 'object' THEN
    RAISE EXCEPTION 'social_links must be a JSON object';
  END IF;

  -- Validate URL fields are strings (when present and non-null)
  IF NEW.content ->> 'whatsapp_invite_url' IS NOT NULL
     AND NEW.content ->> 'whatsapp_invite_url' <> ''
     AND NOT (NEW.content ->> 'whatsapp_invite_url') ~ '^https?://' THEN
    RAISE EXCEPTION 'whatsapp_invite_url must be a valid HTTP(S) URL';
  END IF;

  -- Enforce max lengths to prevent abuse
  IF char_length(COALESCE(NEW.content ->> 'community_intro', '')) > 2000 THEN
    RAISE EXCEPTION 'community_intro exceeds 2000 characters';
  END IF;

  IF char_length(COALESCE(NEW.content ->> 'announcement', '')) > 500 THEN
    RAISE EXCEPTION 'announcement exceeds 500 characters';
  END IF;

  IF char_length(COALESCE(NEW.content ->> 'seo_title', '')) > 200 THEN
    RAISE EXCEPTION 'seo_title exceeds 200 characters';
  END IF;

  IF char_length(COALESCE(NEW.content ->> 'seo_description', '')) > 500 THEN
    RAISE EXCEPTION 'seo_description exceeds 500 characters';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_site_settings_trigger
  BEFORE INSERT OR UPDATE ON public.site_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_site_settings();

CREATE TRIGGER set_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Seed the single settings row
INSERT INTO public.site_settings (id, content) VALUES (1, '{
  "community_intro": "",
  "whatsapp_invite_url": "",
  "social_links": {
    "github": "",
    "twitter": "",
    "instagram": "",
    "linkedin": "",
    "youtube": ""
  },
  "featured_event_id": null,
  "announcement": "",
  "seo_title": "Hustlers Hive — Built by students. For students. Run by students.",
  "seo_description": "A student-driven technology community based in Nashik, Maharashtra."
}'::JSONB);

-- RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Public: can read site settings (safe fields only via API, full row is fine since content is curated)
CREATE POLICY site_settings_public_select ON public.site_settings
  FOR SELECT
  USING (TRUE);

-- Organizers (admin+): can update site settings
CREATE POLICY site_settings_admin_update ON public.site_settings
  FOR UPDATE
  USING (public.is_admin('admin'))
  WITH CHECK (public.is_admin('admin'));
