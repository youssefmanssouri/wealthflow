import {
  resolveCanonicalCategoryId,
  getCategoryById,
  FALLBACK_CATEGORY,
  ALL_CATEGORIES,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
} from '../../src/constants/categories';

describe('src/constants/categories.ts', () => {
  describe('resolveCanonicalCategoryId', () => {
    it('maps legacy Phase 1 category identifiers to canonical UUIDs', () => {
      // Legacy cat_food -> Food & Dining canonical UUID
      expect(resolveCanonicalCategoryId('cat_food')).toBe('c0000000-0000-4000-8000-000000000010');
      // Legacy cat_salary -> Salary canonical UUID
      expect(resolveCanonicalCategoryId('cat_salary')).toBe('c0000000-0000-4000-8000-000000000001');
      // Legacy cat_transport -> Transport canonical UUID
      expect(resolveCanonicalCategoryId('cat_transport')).toBe('c0000000-0000-4000-8000-000000000011');
      // Legacy cat_bills -> Bills & Utilities canonical UUID
      expect(resolveCanonicalCategoryId('cat_bills')).toBe('c0000000-0000-4000-8000-000000000014');
    });

    it('resolves category slugs to canonical UUIDs', () => {
      expect(resolveCanonicalCategoryId('food_dining')).toBe('c0000000-0000-4000-8000-000000000010');
      expect(resolveCanonicalCategoryId('freelance')).toBe('c0000000-0000-4000-8000-000000000002');
    });

    it('preserves valid canonical UUIDs without modification', () => {
      const canonicalId = 'c0000000-0000-4000-8000-000000000012'; // Shopping
      expect(resolveCanonicalCategoryId(canonicalId)).toBe(canonicalId);
    });

    it('preserves arbitrary custom UUIDs or unknown IDs unchanged', () => {
      const customUuid = '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d';
      expect(resolveCanonicalCategoryId(customUuid)).toBe(customUuid);
      expect(resolveCanonicalCategoryId('custom_category_xyz')).toBe('custom_category_xyz');
    });
  });

  describe('getCategoryById', () => {
    it('retrieves category by canonical UUID', () => {
      const cat = getCategoryById('c0000000-0000-4000-8000-000000000010');
      expect(cat.name).toBe('Food & Dining');
      expect(cat.slug).toBe('food_dining');
      expect(cat.type).toBe('expense');
    });

    it('retrieves category by legacy ID via canonical resolution', () => {
      const cat = getCategoryById('cat_shopping');
      expect(cat.name).toBe('Shopping');
      expect(cat.type).toBe('expense');
    });

    it('returns FALLBACK_CATEGORY for unknown or missing category IDs', () => {
      const fallback = getCategoryById('non_existent_category');
      expect(fallback).toEqual(FALLBACK_CATEGORY);
      expect(fallback.name).toBe('General');
    });

    it('contains balanced default income and expense categories', () => {
      expect(EXPENSE_CATEGORIES.length).toBeGreaterThan(0);
      expect(INCOME_CATEGORIES.length).toBeGreaterThan(0);
      expect(ALL_CATEGORIES.length).toBe(EXPENSE_CATEGORIES.length + INCOME_CATEGORIES.length);
    });
  });
});
