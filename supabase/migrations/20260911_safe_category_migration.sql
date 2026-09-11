-- ==============================================================================
-- WEALTHFLOW: SAFE PRODUCTION CATEGORY ARCHITECTURE MIGRATION
-- File: supabase/migrations/20260911_safe_category_migration.sql
-- ==============================================================================

BEGIN;

-- 1. Ensure UUID extension is active
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Add 'slug' column to categories if not already present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'categories' 
      AND column_name = 'slug'
  ) THEN
    ALTER TABLE public.categories ADD COLUMN slug VARCHAR(50);
  END IF;
END $$;

-- 3. Seed/Upsert the 15 Canonical Deterministic Categories
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

-- 4. Safe Foreign Key Re-mapping:
-- Update existing transactions that may reference old legacy random UUIDs to their canonical equivalents
UPDATE public.transactions
SET category_id = 'c0000000-0000-4000-8000-000000000001'
WHERE category_id IN ('bb2872e7-80aa-42df-9b46-54395ca5e393', 'b6567323-d715-4a9e-98e1-f69f20ed222a');

UPDATE public.transactions
SET category_id = 'c0000000-0000-4000-8000-000000000002'
WHERE category_id IN ('9eef3ba5-1b84-4482-a59a-bbe59f91e35d', 'cfdec402-1905-476b-a645-6b2cd4d26241');

UPDATE public.transactions
SET category_id = 'c0000000-0000-4000-8000-000000000004'
WHERE category_id IN ('2a6fbac3-8d04-463e-adac-abd934cf3134', 'e6f43e4f-6166-41ef-9d00-fea6c796ae85');

UPDATE public.transactions
SET category_id = 'c0000000-0000-4000-8000-000000000006'
WHERE category_id IN ('67a07bd3-8a98-4e89-a296-76cdd941b3e3');

UPDATE public.transactions
SET category_id = 'c0000000-0000-4000-8000-000000000010'
WHERE category_id IN ('8dec2675-4591-404e-a9df-aaccec1a38fc', '96fbbcce-988a-46e7-9765-57f86c4bcce5');

UPDATE public.transactions
SET category_id = 'c0000000-0000-4000-8000-000000000011'
WHERE category_id IN ('fbd45cd5-0041-4516-9978-5b450fe1413e', '1b75ce7d-c794-41f5-a1ff-1979410790c4');

UPDATE public.transactions
SET category_id = 'c0000000-0000-4000-8000-000000000012'
WHERE category_id IN ('2b3cafed-2ff0-49a3-8b8b-345647bd43e5');

UPDATE public.transactions
SET category_id = 'c0000000-0000-4000-8000-000000000013'
WHERE category_id IN ('ff91ba9e-c971-425d-9331-49360794fbd7', '5bb7e800-786a-47ea-9c80-dba2fd6692b2');

UPDATE public.transactions
SET category_id = 'c0000000-0000-4000-8000-000000000014'
WHERE category_id IN (
  'aa90e891-640d-47d7-bae7-c17586c0bbbc', 'b64b9267-4f13-45f4-8cf0-4fca156d30ef',
  '45433980-ba16-45b2-a5d7-4170a3c3eabe', 'be8dddca-3125-440e-b849-2e6cfc7210f2'
);

UPDATE public.transactions
SET category_id = 'c0000000-0000-4000-8000-000000000015'
WHERE category_id IN ('0ae3c78e-fa46-437c-be51-15daaed492c1');

UPDATE public.transactions
SET category_id = 'c0000000-0000-4000-8000-000000000016'
WHERE category_id IN ('dc2614d2-e0f1-46b2-866a-82204fc206ac');

UPDATE public.transactions
SET category_id = 'c0000000-0000-4000-8000-000000000018'
WHERE category_id IN ('b48e9764-b5af-4edc-af80-0aac4b956681');

-- 5. Safe Foreign Key Re-mapping for Budgets:
UPDATE public.budgets
SET category_id = 'c0000000-0000-4000-8000-000000000010'
WHERE category_id IN ('8dec2675-4591-404e-a9df-aaccec1a38fc', '96fbbcce-988a-46e7-9765-57f86c4bcce5');

UPDATE public.budgets
SET category_id = 'c0000000-0000-4000-8000-000000000011'
WHERE category_id IN ('fbd45cd5-0041-4516-9978-5b450fe1413e', '1b75ce7d-c794-41f5-a1ff-1979410790c4');

UPDATE public.budgets
SET category_id = 'c0000000-0000-4000-8000-000000000012'
WHERE category_id IN ('2b3cafed-2ff0-49a3-8b8b-345647bd43e5');

UPDATE public.budgets
SET category_id = 'c0000000-0000-4000-8000-000000000013'
WHERE category_id IN ('ff91ba9e-c971-425d-9331-49360794fbd7', '5bb7e800-786a-47ea-9c80-dba2fd6692b2');

UPDATE public.budgets
SET category_id = 'c0000000-0000-4000-8000-000000000014'
WHERE category_id IN (
  'aa90e891-640d-47d7-bae7-c17586c0bbbc', 'b64b9267-4f13-45f4-8cf0-4fca156d30ef',
  '45433980-ba16-45b2-a5d7-4170a3c3eabe', 'be8dddca-3125-440e-b849-2e6cfc7210f2'
);

UPDATE public.budgets
SET category_id = 'c0000000-0000-4000-8000-000000000015'
WHERE category_id IN ('0ae3c78e-fa46-437c-be51-15daaed492c1');

UPDATE public.budgets
SET category_id = 'c0000000-0000-4000-8000-000000000016'
WHERE category_id IN ('dc2614d2-e0f1-46b2-866a-82204fc206ac');

UPDATE public.budgets
SET category_id = 'c0000000-0000-4000-8000-000000000018'
WHERE category_id IN ('b48e9764-b5af-4edc-af80-0aac4b956681');

-- 6. Safely remove duplicate legacy default categories that are no longer referenced
-- Preserves ALL custom user categories (WHERE user_id IS NOT NULL)
DELETE FROM public.categories
WHERE is_default = TRUE 
  AND user_id IS NULL
  AND id NOT IN (
    'c0000000-0000-4000-8000-000000000001',
    'c0000000-0000-4000-8000-000000000002',
    'c0000000-0000-4000-8000-000000000003',
    'c0000000-0000-4000-8000-000000000004',
    'c0000000-0000-4000-8000-000000000005',
    'c0000000-0000-4000-8000-000000000006',
    'c0000000-0000-4000-8000-000000000010',
    'c0000000-0000-4000-8000-000000000011',
    'c0000000-0000-4000-8000-000000000012',
    'c0000000-0000-4000-8000-000000000013',
    'c0000000-0000-4000-8000-000000000014',
    'c0000000-0000-4000-8000-000000000015',
    'c0000000-0000-4000-8000-000000000016',
    'c0000000-0000-4000-8000-000000000017',
    'c0000000-0000-4000-8000-000000000018'
  );

COMMIT;
