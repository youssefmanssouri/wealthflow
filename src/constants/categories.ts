import { Category } from '../types/financial';

export const EXPENSE_CATEGORIES: Category[] = [
  { id: 'c0000000-0000-4000-8000-000000000010', slug: 'food_dining', name: 'Food & Dining', type: 'expense', icon: 'utensils', color: '#F59E0B', isDefault: true },
  { id: 'c0000000-0000-4000-8000-000000000011', slug: 'transport', name: 'Transport', type: 'expense', icon: 'car', color: '#3B82F6', isDefault: true },
  { id: 'c0000000-0000-4000-8000-000000000012', slug: 'shopping', name: 'Shopping', type: 'expense', icon: 'shopping-bag', color: '#EC4899', isDefault: true },
  { id: 'c0000000-0000-4000-8000-000000000013', slug: 'entertainment', name: 'Entertainment', type: 'expense', icon: 'film', color: '#8B5CF6', isDefault: true },
  { id: 'c0000000-0000-4000-8000-000000000014', slug: 'bills_utilities', name: 'Bills & Utilities', type: 'expense', icon: 'receipt', color: '#EF4444', isDefault: true },
  { id: 'c0000000-0000-4000-8000-000000000015', slug: 'health_medical', name: 'Health & Medical', type: 'expense', icon: 'heart-pulse', color: '#10B981', isDefault: true },
  { id: 'c0000000-0000-4000-8000-000000000016', slug: 'education', name: 'Education', type: 'expense', icon: 'graduation-cap', color: '#6366F1', isDefault: true },
  { id: 'c0000000-0000-4000-8000-000000000017', slug: 'subscriptions', name: 'Subscriptions', type: 'expense', icon: 'tv', color: '#06B6D4', isDefault: true },
  { id: 'c0000000-0000-4000-8000-000000000018', slug: 'other_expense', name: 'Other Expenses', type: 'expense', icon: 'more-horizontal', color: '#64748B', isDefault: true },
];

export const INCOME_CATEGORIES: Category[] = [
  { id: 'c0000000-0000-4000-8000-000000000001', slug: 'salary', name: 'Salary', type: 'income', icon: 'briefcase', color: '#10B981', isDefault: true },
  { id: 'c0000000-0000-4000-8000-000000000002', slug: 'freelance', name: 'Freelance', type: 'income', icon: 'laptop', color: '#3B82F6', isDefault: true },
  { id: 'c0000000-0000-4000-8000-000000000003', slug: 'business', name: 'Business', type: 'income', icon: 'building', color: '#8B5CF6', isDefault: true },
  { id: 'c0000000-0000-4000-8000-000000000004', slug: 'investment', name: 'Investment', type: 'income', icon: 'trending-up', color: '#F59E0B', isDefault: true },
  { id: 'c0000000-0000-4000-8000-000000000005', slug: 'gift_bonus', name: 'Gift / Bonus', type: 'income', icon: 'gift', color: '#EC4899', isDefault: true },
  { id: 'c0000000-0000-4000-8000-000000000006', slug: 'other_income', name: 'Other Income', type: 'income', icon: 'plus-circle', color: '#64748B', isDefault: true },
];

export const ALL_CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

export const FALLBACK_CATEGORY: Category = {
  id: 'c0000000-0000-4000-8000-000000000099',
  slug: 'general',
  name: 'General',
  type: 'expense',
  icon: 'circle-dollar-sign',
  color: '#64748B',
  isDefault: true,
};

// Map legacy 'cat_*' identifiers to canonical UUIDs for backward compatibility & migration
export const LEGACY_CATEGORY_MAP: Record<string, string> = {
  cat_food: 'c0000000-0000-4000-8000-000000000010',
  cat_transport: 'c0000000-0000-4000-8000-000000000011',
  cat_shopping: 'c0000000-0000-4000-8000-000000000012',
  cat_entertainment: 'c0000000-0000-4000-8000-000000000013',
  cat_bills: 'c0000000-0000-4000-8000-000000000014',
  cat_health: 'c0000000-0000-4000-8000-000000000015',
  cat_education: 'c0000000-0000-4000-8000-000000000016',
  cat_subscriptions: 'c0000000-0000-4000-8000-000000000017',
  cat_other_exp: 'c0000000-0000-4000-8000-000000000018',
  cat_salary: 'c0000000-0000-4000-8000-000000000001',
  cat_freelance: 'c0000000-0000-4000-8000-000000000002',
  cat_business: 'c0000000-0000-4000-8000-000000000003',
  cat_investment: 'c0000000-0000-4000-8000-000000000004',
  cat_gift: 'c0000000-0000-4000-8000-000000000005',
  cat_other_inc: 'c0000000-0000-4000-8000-000000000006',
};

/**
 * Resolves any legacy slug (e.g. 'cat_food') or stable slug to its canonical Supabase UUID.
 * If already a UUID (e.g. custom category or canonical ID), returns it unmodified.
 */
export const resolveCanonicalCategoryId = (idOrSlug: string): string => {
  if (LEGACY_CATEGORY_MAP[idOrSlug]) {
    return LEGACY_CATEGORY_MAP[idOrSlug];
  }
  const bySlug = ALL_CATEGORIES.find((c) => c.slug === idOrSlug);
  if (bySlug) return bySlug.id;
  const byId = ALL_CATEGORIES.find((c) => c.id === idOrSlug);
  if (byId) return byId.id;
  return idOrSlug;
};

/**
 * Looks up category metadata by canonical UUID, legacy ID, or slug.
 */
export const getCategoryById = (idOrLegacyId: string): Category => {
  const canonicalId = resolveCanonicalCategoryId(idOrLegacyId);
  return (
    ALL_CATEGORIES.find((cat) => cat.id === canonicalId) ||
    ALL_CATEGORIES.find((cat) => cat.id === idOrLegacyId) ||
    FALLBACK_CATEGORY
  );
};
