-- Certificate management tables: templates, batches, and individual certificates.
-- Supports template-based generation, batch issuance, QR verification, and revocation.

-- 1. Certificate Templates
CREATE TABLE public.certificate_templates (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                  TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 200),
  description           TEXT,
  background_storage_path TEXT NOT NULL,
  canvas_width          INT NOT NULL CHECK (canvas_width > 0),
  canvas_height         INT NOT NULL CHECK (canvas_height > 0),
  design_config         JSONB NOT NULL DEFAULT '{}'::JSONB,
  status                TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
  created_by            UUID NOT NULL REFERENCES auth.users (id),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.certificate_templates IS 'Certificate design templates with background images and configurable text/QR placement.';
COMMENT ON COLUMN public.certificate_templates.design_config IS 'JSON config for text placement, font, QR position. Uses normalized 0-1 coordinates.';

CREATE INDEX idx_certificate_templates_status ON public.certificate_templates (status);

ALTER TABLE public.certificate_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY cert_templates_select ON public.certificate_templates
  FOR SELECT USING (public.has_permission('certificates.view'));

CREATE POLICY cert_templates_insert ON public.certificate_templates
  FOR INSERT WITH CHECK (public.has_permission('certificates.manage'));

CREATE POLICY cert_templates_update ON public.certificate_templates
  FOR UPDATE
  USING (public.has_permission('certificates.manage'))
  WITH CHECK (public.has_permission('certificates.manage'));

CREATE POLICY cert_templates_delete ON public.certificate_templates
  FOR DELETE USING (public.has_permission('certificates.manage'));


-- 2. Certificate Batches
CREATE TABLE public.certificate_batches (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 300),
  template_id       UUID NOT NULL REFERENCES public.certificate_templates (id),
  certificate_title TEXT NOT NULL CHECK (char_length(certificate_title) BETWEEN 1 AND 300),
  event_name        TEXT,
  issued_by         UUID NOT NULL REFERENCES auth.users (id),
  status            TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  total_count       INT NOT NULL DEFAULT 0,
  success_count     INT NOT NULL DEFAULT 0,
  failure_count     INT NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at      TIMESTAMPTZ
);

COMMENT ON TABLE public.certificate_batches IS 'Groups of certificates generated together from a single template.';

CREATE INDEX idx_certificate_batches_template ON public.certificate_batches (template_id);
CREATE INDEX idx_certificate_batches_status ON public.certificate_batches (status);

ALTER TABLE public.certificate_batches ENABLE ROW LEVEL SECURITY;

CREATE POLICY cert_batches_select ON public.certificate_batches
  FOR SELECT USING (public.has_permission('certificates.view'));

CREATE POLICY cert_batches_insert ON public.certificate_batches
  FOR INSERT WITH CHECK (public.has_permission('certificates.issue'));

CREATE POLICY cert_batches_update ON public.certificate_batches
  FOR UPDATE
  USING (public.has_permission('certificates.issue'))
  WITH CHECK (public.has_permission('certificates.issue'));


-- 3. Individual Certificates
CREATE TABLE public.certificates (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_number  TEXT NOT NULL UNIQUE,
  verification_token  TEXT NOT NULL UNIQUE,
  batch_id            UUID NOT NULL REFERENCES public.certificate_batches (id),
  template_id         UUID NOT NULL REFERENCES public.certificate_templates (id),
  recipient_name      TEXT NOT NULL CHECK (char_length(recipient_name) BETWEEN 1 AND 300),
  recipient_email     TEXT,
  certificate_title   TEXT NOT NULL,
  event_name          TEXT,
  issued_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  issued_by           UUID NOT NULL REFERENCES auth.users (id),
  status              TEXT NOT NULL DEFAULT 'valid' CHECK (status IN ('valid', 'revoked')),
  file_storage_path   TEXT,
  revoked_at          TIMESTAMPTZ,
  revoked_by          UUID REFERENCES auth.users (id),
  revocation_reason   TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.certificates IS 'Individual issued certificates with unique IDs, verification tokens, and lifecycle status.';
COMMENT ON COLUMN public.certificates.certificate_number IS 'Human-readable certificate ID like HH-2026-0001.';
COMMENT ON COLUMN public.certificates.verification_token IS 'Cryptographically random URL-safe token for public QR verification.';
COMMENT ON COLUMN public.certificates.recipient_email IS 'Stored for admin reference only, never exposed on the public verification page.';

CREATE INDEX idx_certificates_batch ON public.certificates (batch_id);
CREATE INDEX idx_certificates_template ON public.certificates (template_id);
CREATE INDEX idx_certificates_verification ON public.certificates (verification_token);
CREATE INDEX idx_certificates_number ON public.certificates (certificate_number);
CREATE INDEX idx_certificates_status ON public.certificates (status);
CREATE INDEX idx_certificates_recipient ON public.certificates (recipient_name);

ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- Admin read: requires certificates.view permission
CREATE POLICY certificates_admin_select ON public.certificates
  FOR SELECT USING (public.has_permission('certificates.view'));

-- Public verification: anyone can look up by verification_token (handled via API route, not direct DB access)
-- We add a separate policy for the public lookup function below.

CREATE POLICY certificates_insert ON public.certificates
  FOR INSERT WITH CHECK (public.has_permission('certificates.issue'));

CREATE POLICY certificates_update ON public.certificates
  FOR UPDATE
  USING (public.has_permission('certificates.issue') OR public.has_permission('certificates.revoke'))
  WITH CHECK (public.has_permission('certificates.issue') OR public.has_permission('certificates.revoke'));


-- 4. Public verification function (bypasses RLS safely)
CREATE OR REPLACE FUNCTION public.verify_certificate(token TEXT)
RETURNS TABLE (
  certificate_number TEXT,
  recipient_name TEXT,
  certificate_title TEXT,
  event_name TEXT,
  issued_at TIMESTAMPTZ,
  status TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
    SELECT
      c.certificate_number,
      c.recipient_name,
      c.certificate_title,
      c.event_name,
      c.issued_at,
      c.status
    FROM public.certificates c
    WHERE c.verification_token = token
    LIMIT 1;
END;
$$;

COMMENT ON FUNCTION public.verify_certificate IS 'Public certificate verification. Returns only safe public fields. Never exposes email, file paths, or internal IDs.';


-- 5. Add certificate permissions to existing roles
INSERT INTO public.role_permissions (role, permission) VALUES
  -- Super Admin: full certificate management
  ('super_admin', 'certificates.view'),
  ('super_admin', 'certificates.manage'),
  ('super_admin', 'certificates.issue'),
  ('super_admin', 'certificates.revoke'),

  -- Core Team: view and issue
  ('core_team', 'certificates.view'),
  ('core_team', 'certificates.issue')
ON CONFLICT DO NOTHING;


-- 6. Create dedicated storage bucket for certificate files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'certificates',
  'certificates',
  TRUE,
  20971520,  -- 20 MB
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Public read for certificate downloads
CREATE POLICY cert_storage_select
  ON storage.objects FOR SELECT
  USING (bucket_id = 'certificates');

-- Admin upload
CREATE POLICY cert_storage_insert
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'certificates'
    AND public.is_admin('core_team')
  );

-- Admin delete
CREATE POLICY cert_storage_delete
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'certificates'
    AND public.is_admin('super_admin')
  );
