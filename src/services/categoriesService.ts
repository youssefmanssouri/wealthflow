import { supabase, getFriendlyErrorMessage } from './supabase';
import { Category, TransactionType } from '../types/financial';
import { ALL_CATEGORIES } from '../constants/categories';

export const categoriesService = {
  async fetchCategories(): Promise<Category[]> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error || !data || data.length === 0) {
        return ALL_CATEGORIES;
      }

      return data.map((c) => ({
        id: c.id,
        slug: c.slug || undefined,
        name: c.name,
        type: c.type as TransactionType,
        icon: c.icon,
        color: c.color,
        isDefault: c.is_default,
      }));
    } catch (err) {
      console.warn('Categories service fallback:', err);
      return ALL_CATEGORIES;
    }
  },

  async createCustomCategory(userId: string, category: Omit<Category, 'id' | 'isDefault'>) {
    try {
      const generatedSlug = category.slug || category.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '_');
      const { data, error } = await supabase
        .from('categories')
        .insert({
          user_id: userId,
          slug: generatedSlug,
          name: category.name,
          type: category.type,
          icon: category.icon,
          color: category.color,
          is_default: false,
        })
        .select()
        .single();

      if (error) throw error;
      return {
        success: true,
        category: {
          id: data.id,
          slug: data.slug,
          name: data.name,
          type: data.type as TransactionType,
          icon: data.icon,
          color: data.color,
          isDefault: false,
        },
      };
    } catch (err) {
      return { success: false, error: getFriendlyErrorMessage(err) };
    }
  },
};
