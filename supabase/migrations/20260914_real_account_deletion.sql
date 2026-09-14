-- ==============================================================================
-- WEALTHFLOW: REAL SECURE ACCOUNT DELETION RPC
-- File: supabase/migrations/20260914_real_account_deletion.sql
-- ==============================================================================

BEGIN;

CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_user_id UUID := auth.uid();
BEGIN
  -- 1. Security Check: Authenticated session required
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- 2. Explicit reverse-dependency data cleanup
  -- Delete dependent contributions first
  DELETE FROM public.savings_contributions WHERE user_id = v_user_id;

  -- Delete savings goals
  DELETE FROM public.savings_goals WHERE user_id = v_user_id;

  -- Delete budgets
  DELETE FROM public.budgets WHERE user_id = v_user_id;

  -- Delete transactions
  DELETE FROM public.transactions WHERE user_id = v_user_id;

  -- Delete custom categories only (preserve default/system categories)
  DELETE FROM public.categories WHERE user_id = v_user_id AND is_default = FALSE;

  -- Delete user profile
  DELETE FROM public.profiles WHERE id = v_user_id;

  -- Delete user identity from auth.users
  DELETE FROM auth.users WHERE id = v_user_id;

  RETURN jsonb_build_object('success', TRUE);
END;
$$;

-- Security Control: Strict RPC Execution Permissions
REVOKE ALL ON FUNCTION public.delete_user_account() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.delete_user_account() FROM anon;
GRANT EXECUTE ON FUNCTION public.delete_user_account() TO authenticated;

COMMIT;
