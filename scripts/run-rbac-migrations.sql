-- ============================================================================
-- HUSTLERS HIVE — RBAC MIGRATION BUNDLE
-- ============================================================================
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- This combines all 4 RBAC migrations into a single executable script.
-- ============================================================================

-- ── Migration 1: Create profiles table ──────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.profiles (
  user_id    UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  full_name  TEXT NOT NULL CHECK (char_length(full_name) BETWEEN 1 AND 200),
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.profiles IS 'User display information. One row per auth user.';

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY profiles_own_select ON public.profiles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY profiles_own_update ON public.profiles
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY profiles_admin_update ON public.profiles
  FOR UPDATE
  USING (public.is_admin('super_admin'))
  WITH CHECK (public.is_admin('super_admin'));

-- ── Migration 2: Expand roles and add permissions ───────────────────────────

-- Drop the old CHECK constraint
ALTER TABLE public.admin_users
  DROP CONSTRAINT IF EXISTS admin_users_role_check;

-- Migrate existing role values
UPDATE public.admin_users SET role = 'core_team' WHERE role IN ('admin', 'editor');

-- Add new CHECK constraint
ALTER TABLE public.admin_users
  ADD CONSTRAINT admin_users_role_check
  CHECK (role IN ('super_admin', 'core_team', 'volunteer', 'member'));

-- Add status column
ALTER TABLE public.admin_users
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'invited', 'deactivated'));

-- Create role_permissions table
CREATE TABLE IF NOT EXISTS public.role_permissions (
  role       TEXT NOT NULL CHECK (role IN ('super_admin', 'core_team', 'volunteer', 'member')),
  permission TEXT NOT NULL CHECK (char_length(permission) BETWEEN 1 AND 100),
  PRIMARY KEY (role, permission)
);

COMMENT ON TABLE public.role_permissions IS 'Maps roles to explicit permission strings.';

ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- Seed default permissions
INSERT INTO public.role_permissions (role, permission) VALUES
  -- Super Admin
  ('super_admin', 'users.view'),
  ('super_admin', 'users.invite'),
  ('super_admin', 'users.update_role'),
  ('super_admin', 'users.deactivate'),
  ('super_admin', 'events.view'),
  ('super_admin', 'events.create'),
  ('super_admin', 'events.update'),
  ('super_admin', 'events.publish'),
  ('super_admin', 'events.delete'),
  ('super_admin', 'projects.view'),
  ('super_admin', 'projects.create'),
  ('super_admin', 'projects.update'),
  ('super_admin', 'projects.publish'),
  ('super_admin', 'projects.delete'),
  ('super_admin', 'gallery.view'),
  ('super_admin', 'gallery.submit'),
  ('super_admin', 'gallery.publish'),
  ('super_admin', 'gallery.delete'),
  ('super_admin', 'volunteers.manage'),
  ('super_admin', 'tasks.view_assigned'),
  ('super_admin', 'tasks.update_assigned'),
  ('super_admin', 'settings.manage'),
  ('super_admin', 'audit_logs.view'),
  -- Core Team
  ('core_team', 'events.view'),
  ('core_team', 'events.create'),
  ('core_team', 'events.update'),
  ('core_team', 'events.publish'),
  ('core_team', 'projects.view'),
  ('core_team', 'projects.create'),
  ('core_team', 'projects.update'),
  ('core_team', 'projects.publish'),
  ('core_team', 'gallery.view'),
  ('core_team', 'gallery.submit'),
  ('core_team', 'gallery.publish'),
  ('core_team', 'users.view'),
  ('core_team', 'volunteers.manage'),
  ('core_team', 'tasks.view_assigned'),
  ('core_team', 'tasks.update_assigned'),
  -- Volunteer
  ('volunteer', 'events.view'),
  ('volunteer', 'projects.view'),
  ('volunteer', 'gallery.view'),
  ('volunteer', 'gallery.submit'),
  ('volunteer', 'tasks.view_assigned'),
  ('volunteer', 'tasks.update_assigned'),
  -- Member
  ('member', 'events.view'),
  ('member', 'projects.view')
ON CONFLICT DO NOTHING;

-- Update is_admin() for new role hierarchy
CREATE OR REPLACE FUNCTION public.is_admin(required_role TEXT DEFAULT 'volunteer')
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  user_role TEXT;
  user_level INT;
  required_level INT;
BEGIN
  SELECT role INTO user_role
    FROM public.admin_users
   WHERE user_id = auth.uid()
     AND status = 'active';

  IF user_role IS NULL THEN
    RETURN FALSE;
  END IF;

  user_level := CASE user_role
    WHEN 'member'      THEN 0
    WHEN 'volunteer'   THEN 1
    WHEN 'core_team'   THEN 2
    WHEN 'super_admin' THEN 3
    ELSE 0
  END;

  required_level := CASE required_role
    WHEN 'member'      THEN 0
    WHEN 'volunteer'   THEN 1
    WHEN 'editor'      THEN 1
    WHEN 'core_team'   THEN 2
    WHEN 'admin'       THEN 2
    WHEN 'super_admin' THEN 3
    ELSE 0
  END;

  RETURN user_level >= required_level;
END;
$$;

-- Add permission-checking function
CREATE OR REPLACE FUNCTION public.has_permission(required_permission TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
    FROM public.admin_users
   WHERE user_id = auth.uid()
     AND status = 'active';

  IF user_role IS NULL THEN
    RETURN FALSE;
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM public.role_permissions
     WHERE role = user_role
       AND permission = required_permission
  );
END;
$$;

COMMENT ON FUNCTION public.has_permission IS 'Returns true if the current auth user has the specified permission via their role.';

-- RLS for role_permissions
CREATE POLICY role_permissions_select ON public.role_permissions
  FOR SELECT
  USING (public.is_admin('member'));

CREATE POLICY role_permissions_insert ON public.role_permissions
  FOR INSERT
  WITH CHECK (public.is_admin('super_admin'));

CREATE POLICY role_permissions_update ON public.role_permissions
  FOR UPDATE
  USING (public.is_admin('super_admin'))
  WITH CHECK (public.is_admin('super_admin'));

CREATE POLICY role_permissions_delete ON public.role_permissions
  FOR DELETE
  USING (public.is_admin('super_admin'));

-- Fix profiles RLS for new roles
CREATE POLICY profiles_admin_select ON public.profiles
  FOR SELECT
  USING (public.is_admin('volunteer'));

CREATE POLICY profiles_admin_insert ON public.profiles
  FOR INSERT
  WITH CHECK (public.is_admin('core_team'));

-- ── Migration 3: Invitations table ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.invitations (
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

CREATE INDEX IF NOT EXISTS idx_invitations_email ON public.invitations (email);
CREATE INDEX IF NOT EXISTS idx_invitations_status ON public.invitations (status);

CREATE TRIGGER set_invitations_updated_at
  BEFORE UPDATE ON public.invitations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE UNIQUE INDEX IF NOT EXISTS idx_invitations_pending_email
  ON public.invitations (email) WHERE status = 'pending';

ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY invitations_select ON public.invitations
  FOR SELECT
  USING (public.is_admin('core_team'));

CREATE POLICY invitations_insert ON public.invitations
  FOR INSERT
  WITH CHECK (public.is_admin('super_admin'));

CREATE POLICY invitations_update ON public.invitations
  FOR UPDATE
  USING (public.is_admin('super_admin'))
  WITH CHECK (public.is_admin('super_admin'));

-- ── Migration 4: Audit logs ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id    UUID NOT NULL REFERENCES auth.users (id),
  action      TEXT NOT NULL CHECK (char_length(action) BETWEEN 1 AND 100),
  target_type TEXT CHECK (char_length(target_type) BETWEEN 1 AND 50),
  target_id   TEXT,
  metadata    JSONB DEFAULT '{}'::JSONB,
  ip_address  INET,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON public.audit_logs (actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs (action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs (created_at DESC);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY audit_logs_select ON public.audit_logs
  FOR SELECT
  USING (public.is_admin('super_admin') OR public.has_permission('audit_logs.view'));

CREATE POLICY audit_logs_insert ON public.audit_logs
  FOR INSERT
  WITH CHECK (public.is_admin('member') AND auth.uid() = actor_id);

-- ============================================================================
-- DONE! All RBAC tables, functions, and policies are created.
-- Next: Run the bootstrap script to create your Super Admin.
-- ============================================================================
