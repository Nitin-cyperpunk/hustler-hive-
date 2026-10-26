-- FIX: Run this in the Supabase SQL Editor to complete the migration
-- that failed at the role_permissions INSERT.
-- This script is idempotent — safe to run multiple times.

-- 1. Update role_permissions constraint to allow new roles
ALTER TABLE public.role_permissions
  DROP CONSTRAINT IF EXISTS role_permissions_role_check;

ALTER TABLE public.role_permissions
  ADD CONSTRAINT role_permissions_role_check
  CHECK (role IN (
    'super_admin', 'admin', 'operations', 'social_media',
    'creative', 'logistics', 'volunteer', 'member'
  ));

-- 2. Remove old core_team permissions
DELETE FROM public.role_permissions WHERE role = 'core_team';

-- 3. Insert all permissions for expanded role set
INSERT INTO public.role_permissions (role, permission) VALUES
  ('super_admin', 'users.manage_access'),
  ('super_admin', 'tasks.create'),
  ('super_admin', 'tasks.assign'),
  ('super_admin', 'tasks.delete'),
  ('super_admin', 'budgets.view'),
  ('super_admin', 'budgets.create'),
  ('super_admin', 'budgets.approve'),
  ('super_admin', 'expenses.view'),
  ('super_admin', 'expenses.submit'),
  ('super_admin', 'expenses.approve'),
  ('super_admin', 'social.view'),
  ('super_admin', 'social.create'),
  ('super_admin', 'social.publish'),
  ('super_admin', 'creative.view'),
  ('super_admin', 'creative.upload'),
  ('super_admin', 'creative.approve'),
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
  ('creative', 'creative.view'),
  ('creative', 'creative.upload'),
  ('creative', 'gallery.view'),
  ('creative', 'gallery.submit'),
  ('creative', 'events.view'),
  ('creative', 'tasks.view_assigned'),
  ('creative', 'tasks.update_assigned'),
  ('creative', 'projects.view'),
  ('logistics', 'expenses.view'),
  ('logistics', 'expenses.submit'),
  ('logistics', 'budgets.view'),
  ('logistics', 'budgets.create'),
  ('logistics', 'events.view'),
  ('logistics', 'tasks.view_assigned'),
  ('logistics', 'tasks.update_assigned'),
  ('logistics', 'projects.view'),
  ('volunteer', 'social.view'),
  ('volunteer', 'creative.view'),
  ('volunteer', 'budgets.view'),
  ('volunteer', 'expenses.view')
ON CONFLICT (role, permission) DO NOTHING;

-- 4. Create tasks table if not exists
CREATE TABLE IF NOT EXISTS public.tasks (
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

CREATE INDEX IF NOT EXISTS idx_tasks_assigned ON public.tasks (assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_department ON public.tasks (department);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks (status);
CREATE INDEX IF NOT EXISTS idx_tasks_event ON public.tasks (event_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks (due_date);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_tasks_updated_at') THEN
    CREATE TRIGGER set_tasks_updated_at
      BEFORE UPDATE ON public.tasks
      FOR EACH ROW
      EXECUTE FUNCTION public.handle_updated_at();
  END IF;
END $$;

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tasks_admin_select ON public.tasks;
CREATE POLICY tasks_admin_select ON public.tasks
  FOR SELECT USING (public.is_admin('admin'));

DROP POLICY IF EXISTS tasks_department_select ON public.tasks;
CREATE POLICY tasks_department_select ON public.tasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE user_id = auth.uid() AND status = 'active' AND department = tasks.department
    )
  );

DROP POLICY IF EXISTS tasks_own_select ON public.tasks;
CREATE POLICY tasks_own_select ON public.tasks
  FOR SELECT USING (assigned_to = auth.uid());

DROP POLICY IF EXISTS tasks_insert ON public.tasks;
CREATE POLICY tasks_insert ON public.tasks
  FOR INSERT WITH CHECK (
    public.is_admin('admin') OR public.has_permission('tasks.create')
  );

DROP POLICY IF EXISTS tasks_update ON public.tasks;
CREATE POLICY tasks_update ON public.tasks
  FOR UPDATE USING (
    public.is_admin('admin') OR assigned_to = auth.uid()
  ) WITH CHECK (
    public.is_admin('admin') OR assigned_to = auth.uid()
  );

DROP POLICY IF EXISTS tasks_delete ON public.tasks;
CREATE POLICY tasks_delete ON public.tasks
  FOR DELETE USING (public.is_admin('admin'));

-- 5. Task comments
CREATE TABLE IF NOT EXISTS public.task_comments (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id    UUID NOT NULL REFERENCES public.tasks (id) ON DELETE CASCADE,
  author_id  UUID NOT NULL REFERENCES auth.users (id),
  content    TEXT NOT NULL CHECK (char_length(content) >= 1),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_task_comments_task ON public.task_comments (task_id, created_at);

ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS task_comments_select ON public.task_comments;
CREATE POLICY task_comments_select ON public.task_comments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.tasks WHERE id = task_comments.task_id
      AND (
        public.is_admin('admin')
        OR assigned_to = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.admin_users
          WHERE user_id = auth.uid() AND status = 'active' AND department = tasks.department
        )
      )
    )
  );

DROP POLICY IF EXISTS task_comments_insert ON public.task_comments;
CREATE POLICY task_comments_insert ON public.task_comments
  FOR INSERT WITH CHECK (
    auth.uid() = author_id AND public.is_admin('member')
  );

-- 6. Event budgets
CREATE TABLE IF NOT EXISTS public.event_budgets (
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

CREATE INDEX IF NOT EXISTS idx_event_budgets_event ON public.event_budgets (event_id);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_event_budgets_updated_at') THEN
    CREATE TRIGGER set_event_budgets_updated_at
      BEFORE UPDATE ON public.event_budgets
      FOR EACH ROW
      EXECUTE FUNCTION public.handle_updated_at();
  END IF;
END $$;

ALTER TABLE public.event_budgets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS budgets_select ON public.event_budgets;
CREATE POLICY budgets_select ON public.event_budgets
  FOR SELECT USING (public.is_admin('admin') OR public.has_permission('budgets.view'));

DROP POLICY IF EXISTS budgets_insert ON public.event_budgets;
CREATE POLICY budgets_insert ON public.event_budgets
  FOR INSERT WITH CHECK (public.is_admin('admin') OR public.has_permission('budgets.create'));

DROP POLICY IF EXISTS budgets_update ON public.event_budgets;
CREATE POLICY budgets_update ON public.event_budgets
  FOR UPDATE USING (public.is_admin('admin') OR public.has_permission('budgets.approve'));

-- 7. Expenses
CREATE TABLE IF NOT EXISTS public.expenses (
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

CREATE INDEX IF NOT EXISTS idx_expenses_event ON public.expenses (event_id);
CREATE INDEX IF NOT EXISTS idx_expenses_status ON public.expenses (status);
CREATE INDEX IF NOT EXISTS idx_expenses_submitted_by ON public.expenses (submitted_by);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_expenses_updated_at') THEN
    CREATE TRIGGER set_expenses_updated_at
      BEFORE UPDATE ON public.expenses
      FOR EACH ROW
      EXECUTE FUNCTION public.handle_updated_at();
  END IF;
END $$;

ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS expenses_select ON public.expenses;
CREATE POLICY expenses_select ON public.expenses
  FOR SELECT USING (
    public.is_admin('admin') OR public.has_permission('expenses.view') OR submitted_by = auth.uid()
  );

DROP POLICY IF EXISTS expenses_insert ON public.expenses;
CREATE POLICY expenses_insert ON public.expenses
  FOR INSERT WITH CHECK (
    submitted_by = auth.uid() AND (public.is_admin('admin') OR public.has_permission('expenses.submit'))
  );

DROP POLICY IF EXISTS expenses_update ON public.expenses;
CREATE POLICY expenses_update ON public.expenses
  FOR UPDATE USING (
    (submitted_by = auth.uid() AND status IN ('draft', 'rejected'))
    OR (public.is_admin('admin') OR public.has_permission('expenses.approve'))
  );

-- 8. Social posts
CREATE TABLE IF NOT EXISTS public.social_posts (
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

CREATE INDEX IF NOT EXISTS idx_social_posts_status ON public.social_posts (status);
CREATE INDEX IF NOT EXISTS idx_social_posts_event ON public.social_posts (event_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_scheduled ON public.social_posts (scheduled_for);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_social_posts_updated_at') THEN
    CREATE TRIGGER set_social_posts_updated_at
      BEFORE UPDATE ON public.social_posts
      FOR EACH ROW
      EXECUTE FUNCTION public.handle_updated_at();
  END IF;
END $$;

ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS social_posts_select ON public.social_posts;
CREATE POLICY social_posts_select ON public.social_posts
  FOR SELECT USING (public.is_admin('admin') OR public.has_permission('social.view'));

DROP POLICY IF EXISTS social_posts_insert ON public.social_posts;
CREATE POLICY social_posts_insert ON public.social_posts
  FOR INSERT WITH CHECK (
    created_by = auth.uid() AND (public.is_admin('admin') OR public.has_permission('social.create'))
  );

DROP POLICY IF EXISTS social_posts_update ON public.social_posts;
CREATE POLICY social_posts_update ON public.social_posts
  FOR UPDATE USING (
    public.is_admin('admin')
    OR (created_by = auth.uid() AND public.has_permission('social.create'))
    OR public.has_permission('social.publish')
  );

DROP POLICY IF EXISTS social_posts_delete ON public.social_posts;
CREATE POLICY social_posts_delete ON public.social_posts
  FOR DELETE USING (public.is_admin('admin'));

-- 9. Creative assets
CREATE TABLE IF NOT EXISTS public.creative_assets (
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

CREATE INDEX IF NOT EXISTS idx_creative_assets_event ON public.creative_assets (event_id);
CREATE INDEX IF NOT EXISTS idx_creative_assets_status ON public.creative_assets (status);
CREATE INDEX IF NOT EXISTS idx_creative_assets_type ON public.creative_assets (asset_type);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_creative_assets_updated_at') THEN
    CREATE TRIGGER set_creative_assets_updated_at
      BEFORE UPDATE ON public.creative_assets
      FOR EACH ROW
      EXECUTE FUNCTION public.handle_updated_at();
  END IF;
END $$;

ALTER TABLE public.creative_assets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS creative_assets_select ON public.creative_assets;
CREATE POLICY creative_assets_select ON public.creative_assets
  FOR SELECT USING (public.is_admin('admin') OR public.has_permission('creative.view'));

DROP POLICY IF EXISTS creative_assets_insert ON public.creative_assets;
CREATE POLICY creative_assets_insert ON public.creative_assets
  FOR INSERT WITH CHECK (
    created_by = auth.uid() AND (public.is_admin('admin') OR public.has_permission('creative.upload'))
  );

DROP POLICY IF EXISTS creative_assets_update ON public.creative_assets;
CREATE POLICY creative_assets_update ON public.creative_assets
  FOR UPDATE USING (
    public.is_admin('admin')
    OR public.has_permission('creative.approve')
    OR (created_by = auth.uid() AND status = 'draft')
  );

DROP POLICY IF EXISTS creative_assets_delete ON public.creative_assets;
CREATE POLICY creative_assets_delete ON public.creative_assets
  FOR DELETE USING (public.is_admin('admin'));

-- 10. Receipts storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'receipts', 'receipts', false, 10485760,
  ARRAY['image/jpeg','image/png','image/webp','application/pdf']
)
ON CONFLICT (id) DO NOTHING;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'receipts_insert' AND tablename = 'objects') THEN
    CREATE POLICY receipts_insert ON storage.objects
      FOR INSERT WITH CHECK (
        bucket_id = 'receipts'
        AND (public.is_admin('admin') OR public.has_permission('expenses.submit'))
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'receipts_select' AND tablename = 'objects') THEN
    CREATE POLICY receipts_select ON storage.objects
      FOR SELECT USING (
        bucket_id = 'receipts'
        AND (public.is_admin('admin') OR public.has_permission('expenses.view'))
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'receipts_delete' AND tablename = 'objects') THEN
    CREATE POLICY receipts_delete ON storage.objects
      FOR DELETE USING (bucket_id = 'receipts' AND public.is_admin('admin'));
  END IF;
END $$;

-- 11. Update profiles RLS
DROP POLICY IF EXISTS profiles_admin_select ON public.profiles;
CREATE POLICY profiles_admin_select ON public.profiles
  FOR SELECT USING (public.is_admin('volunteer'));

DROP POLICY IF EXISTS profiles_admin_insert ON public.profiles;
CREATE POLICY profiles_admin_insert ON public.profiles
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR public.is_admin('admin')
  );

-- 12. Expense self-approval prevention
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

DROP TRIGGER IF EXISTS check_expense_self_approval ON public.expenses;
CREATE TRIGGER check_expense_self_approval
  BEFORE UPDATE ON public.expenses
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_expense_self_approval();
