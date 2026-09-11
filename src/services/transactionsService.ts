import { supabase, getFriendlyErrorMessage } from './supabase';
import { Transaction, TransactionType } from '../types/financial';
import { getCategoryById, resolveCanonicalCategoryId } from '../constants/categories';

export const transactionsService = {
  async fetchTransactions(userId: string): Promise<Transaction[]> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('transaction_date', { ascending: false });

      if (error) {
        console.warn('Fetch transactions error:', error.message);
        return [];
      }

      return data.map((t) => {
        const cat = getCategoryById(t.category_id);
        return {
          id: t.id,
          userId: t.user_id,
          categoryId: t.category_id,
          categoryName: cat.name,
          categoryIcon: cat.icon,
          categoryColor: cat.color,
          type: t.type as TransactionType,
          amount: Number(t.amount),
          merchant: t.merchant,
          description: t.description || '',
          date: t.transaction_date,
          createdAt: t.created_at,
          updatedAt: t.updated_at,
        };
      });
    } catch (err) {
      console.warn('Transactions fetch error:', err);
      return [];
    }
  },

  async createTransaction(userId: string, transaction: Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) {
    try {
      const canonicalCategoryId = resolveCanonicalCategoryId(transaction.categoryId);
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          category_id: canonicalCategoryId,
          type: transaction.type,
          amount: transaction.amount,
          merchant: transaction.merchant,
          description: transaction.description || '',
          transaction_date: transaction.date,
        })
        .select()
        .single();

      if (error) throw error;

      const cat = getCategoryById(data.category_id);

      return {
        success: true,
        transaction: {
          id: data.id,
          userId: data.user_id,
          categoryId: data.category_id,
          categoryName: cat.name,
          categoryIcon: cat.icon,
          categoryColor: cat.color,
          type: data.type as TransactionType,
          amount: Number(data.amount),
          merchant: data.merchant,
          description: data.description || '',
          date: data.transaction_date,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        },
      };
    } catch (err) {
      return { success: false, error: getFriendlyErrorMessage(err) };
    }
  },

  async updateTransaction(userId: string, transaction: Transaction) {
    try {
      const canonicalCategoryId = resolveCanonicalCategoryId(transaction.categoryId);
      const { data, error } = await supabase
        .from('transactions')
        .update({
          category_id: canonicalCategoryId,
          type: transaction.type,
          amount: transaction.amount,
          merchant: transaction.merchant,
          description: transaction.description || '',
          transaction_date: transaction.date,
          updated_at: new Date().toISOString(),
        })
        .eq('id', transaction.id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      const cat = getCategoryById(data.category_id);

      return {
        success: true,
        transaction: {
          id: data.id,
          userId: data.user_id,
          categoryId: data.category_id,
          categoryName: cat.name,
          categoryIcon: cat.icon,
          categoryColor: cat.color,
          type: data.type as TransactionType,
          amount: Number(data.amount),
          merchant: data.merchant,
          description: data.description || '',
          date: data.transaction_date,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        },
      };
    } catch (err) {
      return { success: false, error: getFriendlyErrorMessage(err) };
    }
  },

  async deleteTransaction(userId: string, transactionId: string) {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', transactionId)
        .eq('user_id', userId);

      if (error) throw error;
      return { success: true };
    } catch (err) {
      return { success: false, error: getFriendlyErrorMessage(err) };
    }
  },
};
