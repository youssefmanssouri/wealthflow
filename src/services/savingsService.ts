import { supabase, getFriendlyErrorMessage } from './supabase';
import { SavingsGoal, SavingsContribution } from '../types/financial';

export const savingsService = {
  async fetchSavingsGoals(userId: string): Promise<SavingsGoal[]> {
    try {
      const { data, error } = await supabase
        .from('savings_goals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (error) {
        console.warn('Fetch savings goals warning:', error.message);
        return [];
      }

      return data.map((g, idx) => {
        const colorsList = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EC4899'];
        const iconsList = ['Shield', 'PiggyBank', 'Briefcase', 'Heart', 'Sparkles'];
        return {
          id: g.id,
          userId: g.user_id,
          name: g.name,
          targetAmount: Number(g.target_amount),
          currentAmount: Number(g.current_amount),
          targetDate: g.target_date,
          monthlyContribution: Math.round(Number(g.target_amount) / 12),
          color: colorsList[idx % colorsList.length],
          icon: iconsList[idx % iconsList.length],
          createdAt: g.created_at,
          updatedAt: g.updated_at,
        };
      });
    } catch (err) {
      console.warn('Savings service fetch error:', err);
      return [];
    }
  },

  async createSavingsGoal(userId: string, goal: Omit<SavingsGoal, 'id' | 'userId' | 'currentAmount' | 'createdAt' | 'updatedAt' | 'monthlyContribution' | 'color' | 'icon'> & { color?: string; icon?: string }) {
    try {
      const { data, error } = await supabase
        .from('savings_goals')
        .insert({
          user_id: userId,
          name: goal.name,
          target_amount: goal.targetAmount,
          current_amount: 0,
          target_date: goal.targetDate,
        })
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        goal: {
          id: data.id,
          userId: data.user_id,
          name: data.name,
          targetAmount: Number(data.target_amount),
          currentAmount: Number(data.current_amount),
          targetDate: data.target_date,
          monthlyContribution: Math.round(Number(data.target_amount) / 12),
          color: goal.color || '#3B82F6',
          icon: goal.icon || 'Target',
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        },
      };
    } catch (err) {
      return { success: false, error: getFriendlyErrorMessage(err) };
    }
  },

  /**
   * Hardened Atomic RPC invocation for Savings Contributions.
   * Calls function `public.add_savings_contribution(p_goal_id, p_amount, p_note, p_date)`.
   */
  async addContribution(
    userId: string,
    goalId: string,
    amount: number,
    note?: string,
    date?: string
  ): Promise<{ success: boolean; contribution?: SavingsContribution; error?: string }> {
    try {
      if (!amount || amount <= 0) {
        return { success: false, error: 'Contribution amount must be greater than zero' };
      }

      const { data, error } = await supabase.rpc('add_savings_contribution', {
        p_goal_id: goalId,
        p_amount: amount,
        p_note: note || null,
        p_date: date || new Date().toISOString(),
      });

      if (error) throw error;

      return {
        success: true,
        contribution: {
          id: data?.id || `contrib_${Date.now()}`,
          userId,
          goalId,
          amount,
          date: date || new Date().toISOString(),
          note,
        },
      };
    } catch (err) {
      return { success: false, error: getFriendlyErrorMessage(err) };
    }
  },

  async deleteSavingsGoal(userId: string, goalId: string) {
    try {
      const { error } = await supabase
        .from('savings_goals')
        .delete()
        .eq('id', goalId)
        .eq('user_id', userId);

      if (error) throw error;
      return { success: true };
    } catch (err) {
      return { success: false, error: getFriendlyErrorMessage(err) };
    }
  },
};
