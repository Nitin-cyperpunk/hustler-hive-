-- Create admin_users table for organizer authorization
-- This table is the single authoritative source for user roles.

CREATE TABLE public.admin_users (
  user_id  UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  role     TEXT NOT NULL CHECK (role IN ('super_admin', 'admin', 'editor')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.admin_users IS 'Authorized organizers and their roles. Single source of truth for authorization.';
COMMENT ON COLUMN public.admin_users.role IS 'One of: super_admin, admin, editor';

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_admin_users_updated_at
  BEFORE UPDATE ON public.admin_users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Helper: check if the current authenticated user holds a given role (or higher).
-- Uses SECURITY DEFINER so RLS policies can call it without recursion.
CREATE OR REPLACE FUNCTION public.is_admin(required_role TEXT DEFAULT 'editor')
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
   WHERE user_id = auth.uid();

  IF user_role IS NULL THEN
    RETURN FALSE;
  END IF;

  CASE required_role
    WHEN 'editor'      THEN RETURN user_role IN ('editor', 'admin', 'super_admin');
    WHEN 'admin'        THEN RETURN user_role IN ('admin', 'super_admin');
    WHEN 'super_admin'  THEN RETURN user_role = 'super_admin';
    ELSE RETURN FALSE;
  END CASE;
END;
$$;

COMMENT ON FUNCTION public.is_admin IS 'Returns true if the current auth user has the required role or higher. Hierarchy: editor < admin < super_admin.';

-- RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Only super_admins can view admin_users
CREATE POLICY admin_users_select ON public.admin_users
  FOR SELECT
  USING (public.is_admin('admin'));

-- Only super_admins can insert/update/delete admin_users
CREATE POLICY admin_users_insert ON public.admin_users
  FOR INSERT
  WITH CHECK (public.is_admin('super_admin'));

CREATE POLICY admin_users_update ON public.admin_users
  FOR UPDATE
  USING (public.is_admin('super_admin'))
  WITH CHECK (public.is_admin('super_admin'));

CREATE POLICY admin_users_delete ON public.admin_users
  FOR DELETE
  USING (public.is_admin('super_admin'));
