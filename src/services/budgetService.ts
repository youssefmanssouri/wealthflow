import { supabase, getFriendlyErrorMessage } from './supabase';
import { Budget } from '../types/financial';
import { getCategoryById, resolveCanonicalCategoryId } from '../constants/categories';

export const budgetService = {
  async fetchBudgets(userId: string): Promise<Budget[]> {
    try {
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        console.warn('Fetch budgets warning:', error.message);
        throw new Error(getFriendlyErrorMessage(error));
      }

      return data.map((b) => {
        const cat = getCategoryById(b.category_id);
        const limitVal = Number(b.amount);
        return {
          id: b.id,
          userId: b.user_id,
          categoryId: b.category_id,
          categoryName: cat.name,
          limit: limitVal,
          amount: limitVal,
          spent: 0,
          period: (b.period as 'monthly' | 'yearly') || 'monthly',
          createdAt: b.created_at,
          updatedAt: b.updated_at,
        };
      });
    } catch (err) {
      console.warn('Budget service fetch error:', err);
      throw err;
    }
  },

  async upsertBudget(userId: string, budget: Omit<Budget, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'categoryName' | 'spent' | 'limit'> & { limit?: number; amount?: number }) {
    try {
      const canonicalCategoryId = resolveCanonicalCategoryId(budget.categoryId);
      const limitVal = budget.limit ?? budget.amount ?? 0;
      const { data, error } = await supabase
        .from('budgets')
        .upsert(
          {
            user_id: userId,
            category_id: canonicalCategoryId,
            amount: limitVal,
            period: budget.period || 'monthly',
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,category_id,period' }
        )
        .select()
        .single();

      if (error) throw error;

      const cat = getCategoryById(data.category_id);

      return {
        success: true,
        budget: {
          id: data.id,
          userId: data.user_id,
          categoryId: data.category_id,
          categoryName: cat.name,
          limit: Number(data.amount),
          amount: Number(data.amount),
          spent: 0,
          period: data.period as 'monthly' | 'yearly',
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        },
      };
    } catch (err) {
      return { success: false, error: getFriendlyErrorMessage(err) };
    }
  },

  async deleteBudget(userId: string, categoryId: string) {
    try {
      const canonicalCategoryId = resolveCanonicalCategoryId(categoryId);
      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('user_id', userId)
        .eq('category_id', canonicalCategoryId);

      if (error) throw error;
      return { success: true };
    } catch (err) {
      return { success: false, error: getFriendlyErrorMessage(err) };
    }
  },
};
