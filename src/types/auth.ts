import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { Currency, ThemeMode } from './financial';

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  currency: Currency;
  themeMode: ThemeMode;
  createdAt: string;
  updatedAt: string;
}

export interface AuthContextType {
  currentUser: UserProfile | null;
  session: Session | null;
  isLoading: boolean;
  isInitializing: boolean;
  isAuthenticated: boolean;
  sessionExpiredMessage: string | null;
  clearSessionExpiredMessage: () => void;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (fullName: string, email: string, password: string) => Promise<{ success: boolean; error?: string; confirmationRequired?: boolean }>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updateProfileState: (updates: Partial<UserProfile>) => void;
}
