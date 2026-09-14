import { supabase, getFriendlyErrorMessage } from './supabase';
import { UserProfile } from '../types/auth';
import { Currency, ThemeMode } from '../types/financial';

export const profileService = {
  async fetchProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.warn('Profile fetch warning:', error.message);
        return null;
      }

      return {
        id: data.id,
        fullName: data.full_name || 'WealthFlow User',
        email: data.email,
        currency: (data.currency as Currency) || 'USD',
        themeMode: (data.theme_mode as ThemeMode) || 'system',
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } catch (err) {
      console.warn('Error reading profile:', err);
      return null;
    }
  },

  async updateProfile(userId: string, updates: { fullName?: string; currency?: Currency; themeMode?: ThemeMode }) {
    try {
      const dbUpdates: any = { updated_at: new Date().toISOString() };
      if (updates.fullName !== undefined) dbUpdates.full_name = updates.fullName;
      if (updates.currency !== undefined) dbUpdates.currency = updates.currency;
      if (updates.themeMode !== undefined) dbUpdates.theme_mode = updates.themeMode;

      const { error } = await supabase
        .from('profiles')
        .update(dbUpdates)
        .eq('id', userId);

      if (error) throw error;
      return { success: true };
    } catch (err) {
      return { success: false, error: getFriendlyErrorMessage(err) };
    }
  },

  async deleteAccount(): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.rpc('delete_user_account');
      if (error) {
        throw error;
      }
      if (!data || data.success !== true) {
        throw new Error(data?.error || 'Failed to delete account.');
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: getFriendlyErrorMessage(err) };
    }
  },
};
