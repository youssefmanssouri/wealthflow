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
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (fullName: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updateProfileState: (updates: Partial<UserProfile>) => void;
}
