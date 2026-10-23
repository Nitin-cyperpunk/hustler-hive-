-- Invitations table for team member onboarding.
-- An invitation creates a pending record that is fulfilled when the invitee
-- signs up via Supabase Auth's invite link or magic link.

CREATE TABLE public.invitations (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email        TEXT NOT NULL CHECK (email ~* '^[^@]+@[^@]+\.[^@]+$'),
  role         TEXT NOT NULL CHECK (role IN ('core_team', 'volunteer', 'member')),
  full_name    TEXT NOT NULL CHECK (char_length(full_name) BETWEEN 1 AND 200),
  status       TEXT NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending', 'accepted', 'expired', 'revoked')),
  invited_by   UUID NOT NULL REFERENCES auth.users (id),
  accepted_by  UUID REFERENCES auth.users (id),
  expires_at   TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '7 days'),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT invitations_no_super_admin CHECK (role <> 'super_admin')
);

COMMENT ON TABLE public.invitations IS 'Pending and historical team invitations. Super Admin cannot be invited — only bootstrapped.';

CREATE INDEX idx_invitations_email ON public.invitations (email);
CREATE INDEX idx_invitations_status ON public.invitations (status);

CREATE TRIGGER set_invitations_updated_at
  BEFORE UPDATE ON public.invitations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Prevent duplicate pending invitations for the same email
CREATE UNIQUE INDEX idx_invitations_pending_email
  ON public.invitations (email) WHERE status = 'pending';

-- RLS
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- Core team+ can view invitations
CREATE POLICY invitations_select ON public.invitations
  FOR SELECT
  USING (public.is_admin('core_team'));

-- Super admin can create invitations
CREATE POLICY invitations_insert ON public.invitations
  FOR INSERT
  WITH CHECK (public.is_admin('super_admin'));

-- Super admin can update (revoke, etc.)
CREATE POLICY invitations_update ON public.invitations
  FOR UPDATE
  USING (public.is_admin('super_admin'))
  WITH CHECK (public.is_admin('super_admin'));
