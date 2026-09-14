-- ==============================================================================
-- WEALTHFLOW PHASE 2 — SUPABASE POSTGRESQL SCHEMA & SECURITY SPECIFICATION
-- ==============================================================================

-- Enable UUID extension if required
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. PROFILES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  currency VARCHAR(10) DEFAULT 'USD',
  theme_mode VARCHAR(10) DEFAULT 'system',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 2. CATEGORIES TABLE
-- Default Categories: user_id IS NULL, is_default = TRUE (Read-Only to users)
-- Custom Categories: user_id = auth.uid(), is_default = FALSE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  slug VARCHAR(50),
  name TEXT NOT NULL,
  type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Default Global Categories with Canonical Deterministic UUIDs
INSERT INTO public.categories (id, slug, name, type, icon, color, is_default) VALUES
  ('c0000000-0000-4000-8000-000000000001', 'salary', 'Salary', 'income', 'briefcase', '#10B981', TRUE),
  ('c0000000-0000-4000-8000-000000000002', 'freelance', 'Freelance', 'income', 'laptop', '#3B82F6', TRUE),
  ('c0000000-0000-4000-8000-000000000003', 'business', 'Business', 'income', 'building', '#8B5CF6', TRUE),
  ('c0000000-0000-4000-8000-000000000004', 'investment', 'Investment', 'income', 'trending-up', '#F59E0B', TRUE),
  ('c0000000-0000-4000-8000-000000000005', 'gift_bonus', 'Gift / Bonus', 'income', 'gift', '#EC4899', TRUE),
  ('c0000000-0000-4000-8000-000000000006', 'other_income', 'Other Income', 'income', 'plus-circle', '#64748B', TRUE),
  ('c0000000-0000-4000-8000-000000000010', 'food_dining', 'Food & Dining', 'expense', 'utensils', '#F59E0B', TRUE),
  ('c0000000-0000-4000-8000-000000000011', 'transport', 'Transport', 'expense', 'car', '#3B82F6', TRUE),
  ('c0000000-0000-4000-8000-000000000012', 'shopping', 'Shopping', 'expense', 'shopping-bag', '#EC4899', TRUE),
  ('c0000000-0000-4000-8000-000000000013', 'entertainment', 'Entertainment', 'expense', 'film', '#8B5CF6', TRUE),
  ('c0000000-0000-4000-8000-000000000014', 'bills_utilities', 'Bills & Utilities', 'expense', 'receipt', '#EF4444', TRUE),
  ('c0000000-0000-4000-8000-000000000015', 'health_medical', 'Health & Medical', 'expense', 'heart-pulse', '#10B981', TRUE),
  ('c0000000-0000-4000-8000-000000000016', 'education', 'Education', 'expense', 'graduation-cap', '#6366F1', TRUE),
  ('c0000000-0000-4000-8000-000000000017', 'subscriptions', 'Subscriptions', 'expense', 'tv', '#06B6D4', TRUE),
  ('c0000000-0000-4000-8000-000000000018', 'other_expense', 'Other Expenses', 'expense', 'more-horizontal', '#64748B', TRUE)
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  name = EXCLUDED.name,
  type = EXCLUDED.type,
  icon = EXCLUDED.icon,
  color = EXCLUDED.color,
  is_default = EXCLUDED.is_default;

-- ------------------------------------------------------------------------------
-- 3. TRANSACTIONS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id),
  type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
  amount NUMERIC NOT NULL CHECK (amount > 0),
  merchant TEXT NOT NULL,
  description TEXT,
  transaction_date TIMESTAMPTZ NOT NULL,
  migration_id TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 4. BUDGETS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id),
  amount NUMERIC NOT NULL CHECK (amount >= 0),
  period VARCHAR(20) DEFAULT 'monthly',
  migration_id TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, category_id, period)
);

-- ------------------------------------------------------------------------------
-- 5. SAVINGS GOALS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.savings_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  target_amount NUMERIC NOT NULL CHECK (target_amount > 0),
  current_amount NUMERIC NOT NULL DEFAULT 0 CHECK (current_amount >= 0),
  target_date TIMESTAMPTZ NOT NULL,
  migration_id TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 6. SAVINGS CONTRIBUTIONS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.savings_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_id UUID NOT NULL REFERENCES public.savings_goals(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  contribution_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  note TEXT,
  migration_id TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 7. HARDENED ATOMIC SAVINGS CONTRIBUTION RPC
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.add_savings_contribution(
  p_goal_id UUID,
  p_amount NUMERIC,
  p_note TEXT DEFAULT NULL,
  p_date TIMESTAMPTZ DEFAULT NOW()
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_goal_owner UUID;
  v_contrib_id UUID;
BEGIN
  -- Security Control 1: Authentication Verification
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Security Control 2: Amount Validation
  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'Contribution amount must be greater than zero';
  END IF;

  -- Security Control 3: Goal Ownership Verification
  SELECT user_id INTO v_goal_owner FROM public.savings_goals WHERE id = p_goal_id;
  IF v_goal_owner IS NULL OR v_goal_owner <> v_user_id THEN
    RAISE EXCEPTION 'Goal not found or unauthorized';
  END IF;

  -- Security Control 4: Atomic Operations within single transaction
  INSERT INTO public.savings_contributions (user_id, goal_id, amount, contribution_date, note)
  VALUES (v_user_id, p_goal_id, p_amount, COALESCE(p_date, NOW()), p_note)
  RETURNING id INTO v_contrib_id;

  -- WealthFlow intentionally permits over-funding savings goals (progress > 100%).
  UPDATE public.savings_goals
  SET current_amount = current_amount + p_amount, updated_at = NOW()
  WHERE id = p_goal_id;

  RETURN jsonb_build_object('id', v_contrib_id, 'status', 'success');
END;
$$;

-- Security Control 5: Restrict RPC Execution Permissions
REVOKE ALL ON FUNCTION public.add_savings_contribution(UUID, NUMERIC, TEXT, TIMESTAMPTZ) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.add_savings_contribution(UUID, NUMERIC, TEXT, TIMESTAMPTZ) TO authenticated;

-- ------------------------------------------------------------------------------
-- 8. HARDENED ATOMIC REAL ACCOUNT DELETION RPC
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_user_id UUID := auth.uid();
BEGIN
  -- Security Control 1: Authentication Verification
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Security Control 2: Explicit Reverse-Dependency Data Cleanup
  DELETE FROM public.savings_contributions WHERE user_id = v_user_id;
  DELETE FROM public.savings_goals WHERE user_id = v_user_id;
  DELETE FROM public.budgets WHERE user_id = v_user_id;
  DELETE FROM public.transactions WHERE user_id = v_user_id;
  DELETE FROM public.categories WHERE user_id = v_user_id AND is_default = FALSE;
  DELETE FROM public.profiles WHERE id = v_user_id;

  -- Security Control 3: Delete Auth Identity (Root Supabase auth.users)
  DELETE FROM auth.users WHERE id = v_user_id;

  RETURN jsonb_build_object('success', TRUE);
END;
$$;

-- Security Control 4: Restrict Account Deletion Permissions
REVOKE ALL ON FUNCTION public.delete_user_account() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.delete_user_account() FROM anon;
GRANT EXECUTE ON FUNCTION public.delete_user_account() TO authenticated;

-- ------------------------------------------------------------------------------
-- 9. AUTOMATIC PROFILE CREATION TRIGGER
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, currency, theme_mode)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'WealthFlow User'),
    NEW.email,
    'USD',
    'system'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------------------------------------------------
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------

-- PROFILES RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- CATEGORIES RLS (Defaults readable by all; Custom managed only by owner)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read default and custom categories" ON public.categories
  FOR SELECT USING (is_default = TRUE OR user_id = auth.uid());
CREATE POLICY "Create custom categories" ON public.categories
  FOR INSERT WITH CHECK (user_id = auth.uid() AND is_default = FALSE);
CREATE POLICY "Update custom categories" ON public.categories
  FOR UPDATE USING (user_id = auth.uid() AND is_default = FALSE);
CREATE POLICY "Delete custom categories" ON public.categories
  FOR DELETE USING (user_id = auth.uid() AND is_default = FALSE);

-- TRANSACTIONS RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Transactions user isolation" ON public.transactions
  FOR ALL USING (user_id = auth.uid());

-- BUDGETS RLS
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Budgets user isolation" ON public.budgets
  FOR ALL USING (user_id = auth.uid());

-- SAVINGS GOALS RLS
ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Savings goals user isolation" ON public.savings_goals
  FOR ALL USING (user_id = auth.uid());

-- SAVINGS CONTRIBUTIONS RLS
ALTER TABLE public.savings_contributions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Savings contributions select isolation" ON public.savings_contributions
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Savings contributions delete isolation" ON public.savings_contributions
  FOR DELETE USING (user_id = auth.uid());
CREATE POLICY "Savings contributions insert authorization check" ON public.savings_contributions
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND EXISTS (
      SELECT 1 FROM public.savings_goals WHERE id = goal_id AND user_id = auth.uid()
    )
  );
