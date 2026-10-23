-- Expand the role system from (super_admin, admin, editor) to
-- (super_admin, core_team, volunteer, member) and add a permissions table.
--
-- Migration strategy:
--   admin  → core_team
--   editor → core_team
-- These are the only roles that could exist in admin_users.

-- 1. Drop the old CHECK constraint
ALTER TABLE public.admin_users
  DROP CONSTRAINT IF EXISTS admin_users_role_check;

-- 2. Migrate existing role values
UPDATE public.admin_users SET role = 'core_team' WHERE role IN ('admin', 'editor');

-- 3. Add new CHECK constraint with expanded roles
ALTER TABLE public.admin_users
  ADD CONSTRAINT admin_users_role_check
  CHECK (role IN ('super_admin', 'core_team', 'volunteer', 'member'));

-- 4. Add optional status column for deactivation
ALTER TABLE public.admin_users
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'invited', 'deactivated'));

-- 5. Create the role_permissions table
CREATE TABLE public.role_permissions (
  role       TEXT NOT NULL CHECK (role IN ('super_admin', 'core_team', 'volunteer', 'member')),
  permission TEXT NOT NULL CHECK (char_length(permission) BETWEEN 1 AND 100),
  PRIMARY KEY (role, permission)
);

COMMENT ON TABLE public.role_permissions IS 'Maps roles to explicit permission strings. Authoritative source for what each role can do.';

-- RLS on role_permissions: readable by any admin, writable only by super_admin
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY role_permissions_select ON public.role_permissions
  FOR SELECT
  USING (public.is_admin('editor'));  -- will be updated after is_admin refresh

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

-- 6. Seed default permissions per role
INSERT INTO public.role_permissions (role, permission) VALUES
  -- Super Admin: all permissions
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

  -- Member (minimal — no admin dashboard access by default)
  ('member', 'events.view'),
  ('member', 'projects.view');

-- 7. Update is_admin() to support the new role hierarchy:
--    member < volunteer < core_team < super_admin
--
--    For backward compat, the old role names map:
--    'editor'  → equivalent to 'volunteer' level
--    'admin'   → equivalent to 'core_team' level
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

  -- Map roles to numeric levels
  user_level := CASE user_role
    WHEN 'member'      THEN 0
    WHEN 'volunteer'   THEN 1
    WHEN 'core_team'   THEN 2
    WHEN 'super_admin' THEN 3
    ELSE 0
  END;

  -- Support both old and new role names in required_role param
  required_level := CASE required_role
    WHEN 'member'      THEN 0
    WHEN 'volunteer'   THEN 1
    WHEN 'editor'      THEN 1  -- backward compat
    WHEN 'core_team'   THEN 2
    WHEN 'admin'       THEN 2  -- backward compat
    WHEN 'super_admin' THEN 3
    ELSE 0
  END;

  RETURN user_level >= required_level;
END;
$$;

-- 8. Add a permission-checking function for granular checks
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

-- 9. Update RLS policies on role_permissions to use new function
DROP POLICY IF EXISTS role_permissions_select ON public.role_permissions;
CREATE POLICY role_permissions_select ON public.role_permissions
  FOR SELECT
  USING (public.is_admin('member'));

-- 10. Update profiles RLS to use new role names
DROP POLICY IF EXISTS profiles_admin_select ON public.profiles;
CREATE POLICY profiles_admin_select ON public.profiles
  FOR SELECT
  USING (public.is_admin('volunteer'));

DROP POLICY IF EXISTS profiles_admin_insert ON public.profiles;
CREATE POLICY profiles_admin_insert ON public.profiles
  FOR INSERT
  WITH CHECK (public.is_admin('core_team'));
