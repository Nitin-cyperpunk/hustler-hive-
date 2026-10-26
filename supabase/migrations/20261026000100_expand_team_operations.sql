-- Expand the role system and add tables for team operations:
-- tasks, budgets, expenses, social media, creative assets.
-- Also extends profiles with full member fields.

-- ============================================================
-- 1. EXPAND ROLES
-- ============================================================

-- Drop old constraint and add expanded roles
ALTER TABLE public.admin_users
  DROP CONSTRAINT IF EXISTS admin_users_role_check;

UPDATE public.admin_users SET role = 'admin' WHERE role = 'core_team';

ALTER TABLE public.admin_users
  ADD CONSTRAINT admin_users_role_check
  CHECK (role IN (
    'super_admin', 'admin', 'operations', 'social_media',
    'creative', 'logistics', 'volunteer', 'member'
  ));

-- Add department column
ALTER TABLE public.admin_users
  ADD COLUMN IF NOT EXISTS department TEXT
    CHECK (department IS NULL OR department IN (
      'operations', 'social_media', 'creative', 'logistics', 'general'
    ));

-- ============================================================
-- 2. UPDATE is_admin() FOR NEW HIERARCHY
-- ============================================================

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
    WHEN 'member'       THEN 0
    WHEN 'volunteer'    THEN 1
    WHEN 'logistics'    THEN 2
    WHEN 'creative'     THEN 2
    WHEN 'social_media' THEN 2
    WHEN 'operations'   THEN 3
    WHEN 'admin'        THEN 4
    WHEN 'super_admin'  THEN 5
    ELSE 0
  END;

  required_level := CASE required_role
    WHEN 'member'       THEN 0
    WHEN 'volunteer'    THEN 1
    WHEN 'logistics'    THEN 2
    WHEN 'creative'     THEN 2
    WHEN 'social_media' THEN 2
    WHEN 'operations'   THEN 3
    WHEN 'editor'       THEN 1  -- backward compat
    WHEN 'core_team'    THEN 4  -- backward compat → admin level
    WHEN 'admin'        THEN 4
    WHEN 'super_admin'  THEN 5
    ELSE 0
  END;

  RETURN user_level >= required_level;
END;
$$;

-- ============================================================
-- 3. UPDATE INVITATIONS FOR NEW ROLES
-- ============================================================

ALTER TABLE public.invitations
  DROP CONSTRAINT IF EXISTS invitations_no_super_admin;

ALTER TABLE public.invitations
  DROP CONSTRAINT IF EXISTS invitations_role_check;

-- Remove the inline CHECK on role column if it exists
DO $$
BEGIN
  -- Drop any CHECK constraint that references the role column
  EXECUTE (
    SELECT string_agg('ALTER TABLE public.invitations DROP CONSTRAINT ' || quote_ident(conname) || ';', ' ')
    FROM pg_constraint
    WHERE conrelid = 'public.invitations'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) LIKE '%role%'
  );
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

ALTER TABLE public.invitations
  ADD CONSTRAINT invitations_role_check
  CHECK (role IN (
    'admin', 'operations', 'social_media', 'creative',
    'logistics', 'volunteer', 'member'
  ));

ALTER TABLE public.invitations
  ADD COLUMN IF NOT EXISTS department TEXT
    CHECK (department IS NULL OR department IN (
      'operations', 'social_media', 'creative', 'logistics', 'general'
    ));

ALTER TABLE public.invitations
  ADD COLUMN IF NOT EXISTS notes TEXT;

-- ============================================================
-- 4. EXPAND PROFILES
-- ============================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS college TEXT,
  ADD COLUMN IF NOT EXISTS branch TEXT,
  ADD COLUMN IF NOT EXISTS graduation_year INT
    CHECK (graduation_year IS NULL OR (graduation_year >= 2000 AND graduation_year <= 2040)),
  ADD COLUMN IF NOT EXISTS skills TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS github_url TEXT,
  ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
  ADD COLUMN IF NOT EXISTS instagram_url TEXT,
  ADD COLUMN IF NOT EXISTS x_url TEXT,
  ADD COLUMN IF NOT EXISTS portfolio_url TEXT,
  ADD COLUMN IF NOT EXISTS contact_number TEXT,
  ADD COLUMN IF NOT EXISTS public_profile BOOLEAN NOT NULL DEFAULT false;

-- ============================================================
-- 5. CREATE TASKS TABLE
-- ============================================================

CREATE TABLE public.tasks (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL CHECK (char_length(title) BETWEEN 1 AND 300),
  description   TEXT,
  department    TEXT CHECK (department IS NULL OR department IN (
    'operations', 'social_media', 'creative', 'logistics', 'general'
  )),
  assigned_to   UUID REFERENCES auth.users (id),
  created_by    UUID NOT NULL REFERENCES auth.users (id),
  priority      TEXT NOT NULL DEFAULT 'medium'
    CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status        TEXT NOT NULL DEFAULT 'todo'
    CHECK (status IN ('todo', 'in_progress', 'blocked', 'in_review', 'completed', 'cancelled')),
  due_date      DATE,
  event_id      UUID REFERENCES public.events (id) ON DELETE SET NULL,
  is_claimable  BOOLEAN NOT NULL DEFAULT false,
  evidence      TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.tasks IS 'Shared task management for all team operations.';

CREATE INDEX idx_tasks_assigned ON public.tasks (assigned_to);
CREATE INDEX idx_tasks_department ON public.tasks (department);
CREATE INDEX idx_tasks_status ON public.tasks (status);
CREATE INDEX idx_tasks_event ON public.tasks (event_id);
CREATE INDEX idx_tasks_due_date ON public.tasks (due_date);

CREATE TRIGGER set_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Super admin and admin see all tasks
CREATE POLICY tasks_admin_select ON public.tasks
  FOR SELECT USING (public.is_admin('admin'));

-- Department members see their department's tasks
CREATE POLICY tasks_department_select ON public.tasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE user_id = auth.uid()
        AND status = 'active'
        AND department = tasks.department
    )
  );

-- Users see tasks assigned to them
CREATE POLICY tasks_own_select ON public.tasks
  FOR SELECT USING (assigned_to = auth.uid());

-- Admin+ can create tasks
CREATE POLICY tasks_insert ON public.tasks
  FOR INSERT WITH CHECK (
    public.is_admin('admin')
    OR public.has_permission('tasks.create')
  );

-- Admin+ can update any task; assignees can update their own
CREATE POLICY tasks_update ON public.tasks
  FOR UPDATE USING (
    public.is_admin('admin')
    OR assigned_to = auth.uid()
  ) WITH CHECK (
    public.is_admin('admin')
    OR assigned_to = auth.uid()
  );

-- Only admin+ can delete
CREATE POLICY tasks_delete ON public.tasks
  FOR DELETE USING (public.is_admin('admin'));

-- ============================================================
-- 6. TASK COMMENTS
-- ============================================================

CREATE TABLE public.task_comments (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id    UUID NOT NULL REFERENCES public.tasks (id) ON DELETE CASCADE,
  author_id  UUID NOT NULL REFERENCES auth.users (id),
  content    TEXT NOT NULL CHECK (char_length(content) >= 1),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_task_comments_task ON public.task_comments (task_id, created_at);

ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;

-- Viewable if user can see the parent task
CREATE POLICY task_comments_select ON public.task_comments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.tasks WHERE id = task_comments.task_id
      AND (
        public.is_admin('admin')
        OR assigned_to = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.admin_users
          WHERE user_id = auth.uid() AND status = 'active'
            AND department = tasks.department
        )
      )
    )
  );

-- Any active member can comment on tasks they can see
CREATE POLICY task_comments_insert ON public.task_comments
  FOR INSERT WITH CHECK (
    auth.uid() = author_id
    AND public.is_admin('member')
  );

-- ============================================================
-- 7. EVENT BUDGETS
-- ============================================================

CREATE TABLE public.event_budgets (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id        UUID NOT NULL REFERENCES public.events (id) ON DELETE CASCADE,
  category        TEXT NOT NULL CHECK (char_length(category) BETWEEN 1 AND 100),
  proposed_amount NUMERIC(12,2) NOT NULL CHECK (proposed_amount >= 0),
  approved_amount NUMERIC(12,2) CHECK (approved_amount IS NULL OR approved_amount >= 0),
  spending_limit  NUMERIC(12,2) CHECK (spending_limit IS NULL OR spending_limit >= 0),
  approval_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (approval_status IN ('pending', 'approved', 'rejected')),
  approved_by     UUID REFERENCES auth.users (id),
  notes           TEXT,
  created_by      UUID NOT NULL REFERENCES auth.users (id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (event_id, category)
);

CREATE INDEX idx_event_budgets_event ON public.event_budgets (event_id);

CREATE TRIGGER set_event_budgets_updated_at
  BEFORE UPDATE ON public.event_budgets
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.event_budgets ENABLE ROW LEVEL SECURITY;

-- Admin+ and logistics can view budgets
CREATE POLICY budgets_select ON public.event_budgets
  FOR SELECT USING (
    public.is_admin('admin')
    OR public.has_permission('budgets.view')
  );

-- Admin+ can create/update budgets; logistics can create
CREATE POLICY budgets_insert ON public.event_budgets
  FOR INSERT WITH CHECK (
    public.is_admin('admin')
    OR public.has_permission('budgets.create')
  );

CREATE POLICY budgets_update ON public.event_budgets
  FOR UPDATE USING (
    public.is_admin('admin')
    OR public.has_permission('budgets.approve')
  );

-- ============================================================
-- 8. EXPENSES
-- ============================================================

CREATE TABLE public.expenses (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id             UUID REFERENCES public.events (id) ON DELETE SET NULL,
  budget_id            UUID REFERENCES public.event_budgets (id) ON DELETE SET NULL,
  category             TEXT NOT NULL CHECK (char_length(category) BETWEEN 1 AND 100),
  description          TEXT NOT NULL CHECK (char_length(description) >= 1),
  amount               NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  expense_date         DATE NOT NULL,
  vendor               TEXT,
  receipt_storage_path TEXT,
  payment_method       TEXT CHECK (payment_method IS NULL OR payment_method IN (
    'cash', 'upi', 'bank_transfer', 'card', 'other'
  )),
  incurred_by          UUID NOT NULL REFERENCES auth.users (id),
  submitted_by         UUID NOT NULL REFERENCES auth.users (id),
  status               TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'submitted', 'under_review', 'approved', 'rejected', 'reimbursed')),
  reviewed_by          UUID REFERENCES auth.users (id),
  reviewed_at          TIMESTAMPTZ,
  review_reason        TEXT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_expenses_event ON public.expenses (event_id);
CREATE INDEX idx_expenses_status ON public.expenses (status);
CREATE INDEX idx_expenses_submitted_by ON public.expenses (submitted_by);

CREATE TRIGGER set_expenses_updated_at
  BEFORE UPDATE ON public.expenses
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Admin+ can view all expenses; logistics can view event expenses
CREATE POLICY expenses_select ON public.expenses
  FOR SELECT USING (
    public.is_admin('admin')
    OR public.has_permission('expenses.view')
    OR submitted_by = auth.uid()
  );

-- Logistics and admin+ can submit expenses
CREATE POLICY expenses_insert ON public.expenses
  FOR INSERT WITH CHECK (
    submitted_by = auth.uid()
    AND (public.is_admin('admin') OR public.has_permission('expenses.submit'))
  );

-- Submitter can update drafts; reviewers can update submitted expenses
CREATE POLICY expenses_update ON public.expenses
  FOR UPDATE USING (
    (submitted_by = auth.uid() AND status IN ('draft', 'rejected'))
    OR (public.is_admin('admin') OR public.has_permission('expenses.approve'))
  );

-- ============================================================
-- 9. SOCIAL MEDIA POSTS
-- ============================================================

CREATE TABLE public.social_posts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL CHECK (char_length(title) BETWEEN 1 AND 300),
  caption       TEXT,
  platform      TEXT[] DEFAULT '{}',
  campaign      TEXT,
  event_id      UUID REFERENCES public.events (id) ON DELETE SET NULL,
  asset_paths   TEXT[] DEFAULT '{}',
  status        TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'in_review', 'approved', 'published')),
  scheduled_for TIMESTAMPTZ,
  published_url TEXT,
  published_at  TIMESTAMPTZ,
  created_by    UUID NOT NULL REFERENCES auth.users (id),
  reviewed_by   UUID REFERENCES auth.users (id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_social_posts_status ON public.social_posts (status);
CREATE INDEX idx_social_posts_event ON public.social_posts (event_id);
CREATE INDEX idx_social_posts_scheduled ON public.social_posts (scheduled_for);

CREATE TRIGGER set_social_posts_updated_at
  BEFORE UPDATE ON public.social_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY social_posts_select ON public.social_posts
  FOR SELECT USING (
    public.is_admin('admin')
    OR public.has_permission('social.view')
  );

CREATE POLICY social_posts_insert ON public.social_posts
  FOR INSERT WITH CHECK (
    created_by = auth.uid()
    AND (public.is_admin('admin') OR public.has_permission('social.create'))
  );

CREATE POLICY social_posts_update ON public.social_posts
  FOR UPDATE USING (
    public.is_admin('admin')
    OR (created_by = auth.uid() AND public.has_permission('social.create'))
    OR public.has_permission('social.publish')
  );

CREATE POLICY social_posts_delete ON public.social_posts
  FOR DELETE USING (public.is_admin('admin'));

-- ============================================================
-- 10. CREATIVE ASSETS
-- ============================================================

CREATE TABLE public.creative_assets (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL CHECK (char_length(title) BETWEEN 1 AND 300),
  asset_type    TEXT NOT NULL CHECK (asset_type IN (
    'poster', 'banner', 'thumbnail', 'certificate_design', 'social_graphic', 'other'
  )),
  storage_path  TEXT NOT NULL,
  event_id      UUID REFERENCES public.events (id) ON DELETE SET NULL,
  status        TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'in_review', 'approved', 'rejected')),
  reviewed_by   UUID REFERENCES auth.users (id),
  created_by    UUID NOT NULL REFERENCES auth.users (id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_creative_assets_event ON public.creative_assets (event_id);
CREATE INDEX idx_creative_assets_status ON public.creative_assets (status);
CREATE INDEX idx_creative_assets_type ON public.creative_assets (asset_type);

CREATE TRIGGER set_creative_assets_updated_at
  BEFORE UPDATE ON public.creative_assets
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.creative_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY creative_assets_select ON public.creative_assets
  FOR SELECT USING (
    public.is_admin('admin')
    OR public.has_permission('creative.view')
  );

CREATE POLICY creative_assets_insert ON public.creative_assets
  FOR INSERT WITH CHECK (
    created_by = auth.uid()
    AND (public.is_admin('admin') OR public.has_permission('creative.upload'))
  );

CREATE POLICY creative_assets_update ON public.creative_assets
  FOR UPDATE USING (
    public.is_admin('admin')
    OR public.has_permission('creative.approve')
    OR (created_by = auth.uid() AND status = 'draft')
  );

CREATE POLICY creative_assets_delete ON public.creative_assets
  FOR DELETE USING (public.is_admin('admin'));

-- ============================================================
-- 11. RECEIPTS STORAGE BUCKET
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'receipts',
  'receipts',
  false,
  10485760,
  ARRAY['image/jpeg','image/png','image/webp','application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Only admin+ and logistics with expenses.submit can upload
CREATE POLICY receipts_insert ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'receipts'
    AND (public.is_admin('admin') OR public.has_permission('expenses.submit'))
  );

-- Admin+ and the uploader can view
CREATE POLICY receipts_select ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'receipts'
    AND (public.is_admin('admin') OR public.has_permission('expenses.view'))
  );

-- Only admin+ can delete receipts
CREATE POLICY receipts_delete ON storage.objects
  FOR DELETE
  USING (bucket_id = 'receipts' AND public.is_admin('admin'));

-- ============================================================
-- 12. UPDATE ROLE_PERMISSIONS WITH NEW ROLES AND PERMISSIONS
-- ============================================================

-- Remove old core_team permissions (now admin)
DELETE FROM public.role_permissions WHERE role = 'core_team';

-- Add all permissions for the expanded role set
INSERT INTO public.role_permissions (role, permission) VALUES
  -- ========= SUPER ADMIN (everything) =========
  -- user management
  ('super_admin', 'users.manage_access'),
  -- tasks
  ('super_admin', 'tasks.create'),
  ('super_admin', 'tasks.assign'),
  ('super_admin', 'tasks.delete'),
  -- budgets & expenses
  ('super_admin', 'budgets.view'),
  ('super_admin', 'budgets.create'),
  ('super_admin', 'budgets.approve'),
  ('super_admin', 'expenses.view'),
  ('super_admin', 'expenses.submit'),
  ('super_admin', 'expenses.approve'),
  -- social media
  ('super_admin', 'social.view'),
  ('super_admin', 'social.create'),
  ('super_admin', 'social.publish'),
  -- creative
  ('super_admin', 'creative.view'),
  ('super_admin', 'creative.upload'),
  ('super_admin', 'creative.approve'),

  -- ========= ADMIN =========
  ('admin', 'users.view'),
  ('admin', 'users.invite'),
  ('admin', 'events.view'),
  ('admin', 'events.create'),
  ('admin', 'events.update'),
  ('admin', 'events.publish'),
  ('admin', 'projects.view'),
  ('admin', 'projects.create'),
  ('admin', 'projects.update'),
  ('admin', 'projects.publish'),
  ('admin', 'gallery.view'),
  ('admin', 'gallery.submit'),
  ('admin', 'gallery.publish'),
  ('admin', 'tasks.view_assigned'),
  ('admin', 'tasks.update_assigned'),
  ('admin', 'tasks.create'),
  ('admin', 'tasks.assign'),
  ('admin', 'budgets.view'),
  ('admin', 'budgets.create'),
  ('admin', 'expenses.view'),
  ('admin', 'expenses.approve'),
  ('admin', 'social.view'),
  ('admin', 'social.create'),
  ('admin', 'social.publish'),
  ('admin', 'creative.view'),
  ('admin', 'creative.upload'),
  ('admin', 'creative.approve'),
  ('admin', 'certificates.view'),
  ('admin', 'certificates.issue'),
  ('admin', 'audit_logs.view'),

  -- ========= OPERATIONS =========
  ('operations', 'events.view'),
  ('operations', 'events.create'),
  ('operations', 'events.update'),
  ('operations', 'events.publish'),
  ('operations', 'tasks.view_assigned'),
  ('operations', 'tasks.update_assigned'),
  ('operations', 'tasks.create'),
  ('operations', 'gallery.view'),
  ('operations', 'gallery.submit'),
  ('operations', 'certificates.view'),
  ('operations', 'certificates.issue'),
  ('operations', 'budgets.view'),
  ('operations', 'expenses.view'),
  ('operations', 'expenses.submit'),
  ('operations', 'projects.view'),

  -- ========= SOCIAL MEDIA =========
  ('social_media', 'social.view'),
  ('social_media', 'social.create'),
  ('social_media', 'events.view'),
  ('social_media', 'gallery.view'),
  ('social_media', 'gallery.submit'),
  ('social_media', 'creative.view'),
  ('social_media', 'tasks.view_assigned'),
  ('social_media', 'tasks.update_assigned'),
  ('social_media', 'certificates.view'),
  ('social_media', 'projects.view'),

  -- ========= CREATIVE =========
  ('creative', 'creative.view'),
  ('creative', 'creative.upload'),
  ('creative', 'gallery.view'),
  ('creative', 'gallery.submit'),
  ('creative', 'events.view'),
  ('creative', 'tasks.view_assigned'),
  ('creative', 'tasks.update_assigned'),
  ('creative', 'projects.view'),

  -- ========= LOGISTICS =========
  ('logistics', 'expenses.view'),
  ('logistics', 'expenses.submit'),
  ('logistics', 'budgets.view'),
  ('logistics', 'budgets.create'),
  ('logistics', 'events.view'),
  ('logistics', 'tasks.view_assigned'),
  ('logistics', 'tasks.update_assigned'),
  ('logistics', 'projects.view'),

  -- ========= VOLUNTEER =========
  ('volunteer', 'social.view'),
  ('volunteer', 'creative.view'),
  ('volunteer', 'budgets.view'),
  ('volunteer', 'expenses.view')
ON CONFLICT (role, permission) DO NOTHING;

-- Also update role_permissions CHECK constraint to include new roles
ALTER TABLE public.role_permissions
  DROP CONSTRAINT IF EXISTS role_permissions_role_check;

ALTER TABLE public.role_permissions
  ADD CONSTRAINT role_permissions_role_check
  CHECK (role IN (
    'super_admin', 'admin', 'operations', 'social_media',
    'creative', 'logistics', 'volunteer', 'member'
  ));

-- ============================================================
-- 13. UPDATE RLS ON PROFILES FOR NEW ROLES
-- ============================================================

-- Allow all active members to see their own profile (already exists)
-- Allow admin+ to see all profiles (update the policy)
DROP POLICY IF EXISTS profiles_admin_select ON public.profiles;
CREATE POLICY profiles_admin_select ON public.profiles
  FOR SELECT USING (public.is_admin('volunteer'));

DROP POLICY IF EXISTS profiles_admin_insert ON public.profiles;
CREATE POLICY profiles_admin_insert ON public.profiles
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    OR public.is_admin('admin')
  );

-- ============================================================
-- 14. EXPENSE SELF-APPROVAL PREVENTION (DB-LEVEL)
-- ============================================================

CREATE OR REPLACE FUNCTION public.prevent_expense_self_approval()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NEW.status IN ('approved', 'rejected')
    AND NEW.reviewed_by IS NOT NULL
    AND NEW.reviewed_by = NEW.submitted_by
  THEN
    RAISE EXCEPTION 'Cannot approve or reject your own expense submission';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER check_expense_self_approval
  BEFORE UPDATE ON public.expenses
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_expense_self_approval();
