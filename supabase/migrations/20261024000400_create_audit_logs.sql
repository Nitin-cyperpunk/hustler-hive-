-- Audit log for security-sensitive administrative actions.
-- Entries are immutable via RLS — no UPDATE or DELETE for any role.

CREATE TABLE public.audit_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id    UUID NOT NULL REFERENCES auth.users (id),
  action      TEXT NOT NULL CHECK (char_length(action) BETWEEN 1 AND 100),
  target_type TEXT CHECK (char_length(target_type) BETWEEN 1 AND 50),
  target_id   TEXT,
  metadata    JSONB DEFAULT '{}'::JSONB,
  ip_address  INET,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.audit_logs IS 'Immutable audit trail for security-sensitive admin actions.';
COMMENT ON COLUMN public.audit_logs.action IS 'Action performed, e.g. invitation.created, role.changed, user.deactivated';
COMMENT ON COLUMN public.audit_logs.target_type IS 'Type of entity acted on, e.g. user, invitation, event';
COMMENT ON COLUMN public.audit_logs.metadata IS 'Safe contextual data — must NEVER contain passwords, tokens, or secrets.';

CREATE INDEX idx_audit_logs_actor ON public.audit_logs (actor_id);
CREATE INDEX idx_audit_logs_action ON public.audit_logs (action);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs (created_at DESC);

-- RLS — append-only for admins, readable by super_admin/core_team with audit_logs.view permission
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Super admin and core_team with permission can read
CREATE POLICY audit_logs_select ON public.audit_logs
  FOR SELECT
  USING (public.is_admin('super_admin') OR public.has_permission('audit_logs.view'));

-- Any active admin can insert (logging their own actions)
CREATE POLICY audit_logs_insert ON public.audit_logs
  FOR INSERT
  WITH CHECK (public.is_admin('member') AND auth.uid() = actor_id);

-- No UPDATE or DELETE policies — logs are immutable
