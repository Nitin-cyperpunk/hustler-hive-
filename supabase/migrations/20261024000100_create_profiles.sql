-- Create profiles table for user display information.
-- Every auth.users entry can have a profile. This is separate from admin_users
-- (which tracks authorization). Profiles store names and display info.

CREATE TABLE public.profiles (
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

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Admins (core_team+) can view all profiles
CREATE POLICY profiles_admin_select ON public.profiles
  FOR SELECT
  USING (public.is_admin('editor'));

-- Users can view their own profile
CREATE POLICY profiles_own_select ON public.profiles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Super admins can insert profiles (during invitation)
CREATE POLICY profiles_admin_insert ON public.profiles
  FOR INSERT
  WITH CHECK (public.is_admin('admin'));

-- Users can update their own profile
CREATE POLICY profiles_own_update ON public.profiles
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Super admins can update any profile
CREATE POLICY profiles_admin_update ON public.profiles
  FOR UPDATE
  USING (public.is_admin('super_admin'))
  WITH CHECK (public.is_admin('super_admin'));
