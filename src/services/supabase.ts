import { Platform } from 'react-native';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://demo-wealthflow.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlbW8iLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY3MjUxMjAwMCwiZXhwIjoyMDA4MDg4MDAwfQ.demo_anon_key_wealthflow';

// Web-safe storage fallback wrapper
const customStorage = {
  getItem: (key: string) => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        return Promise.resolve(window.localStorage.getItem(key));
      }
      return Promise.resolve(null);
    }
    return AsyncStorage.getItem(key);
  },
  setItem: (key: string, value: string) => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
      return Promise.resolve();
    }
    return AsyncStorage.setItem(key, value);
  },
  removeItem: (key: string) => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
      return Promise.resolve();
    }
    return AsyncStorage.removeItem(key);
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: customStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

/**
 * Translates backend / database error objects into user-friendly localized messages.
 */
export function getFriendlyErrorMessage(error: any): string {
  if (!error) return 'An unexpected error occurred. Please try again.';
  
  const code =
    typeof error === 'object' && error !== null
      ? String(error.code || error.statusCode || error.status || '')
      : '';
  const message =
    typeof error === 'string'
      ? error
      : String(error.message || error.details || error.error_description || error.hint || '');

  const lowerMsg = message.toLowerCase();
  const upperCode = code.toUpperCase();

  // 1. Session expiration and authentication token invalidation
  if (
    upperCode === 'PGRST301' ||
    lowerMsg.includes('pgrst301') ||
    lowerMsg.includes('jwt expired') ||
    lowerMsg.includes('token is expired') ||
    lowerMsg.includes('token has expired') ||
    lowerMsg.includes('token expired') ||
    lowerMsg.includes('invalid claim') ||
    lowerMsg.includes('invalid sub claim') ||
    lowerMsg.includes('invalid jwt') ||
    lowerMsg.includes('jwt malformed') ||
    lowerMsg.includes('session expired') ||
    lowerMsg.includes('session from cookies has expired')
  ) {
    return 'Your session has expired. Please sign in again.';
  }

  // 2. Existing friendly mappings
  if (message.includes('Invalid login credentials')) {
    return 'Invalid email or password. Please check your credentials and try again.';
  }
  if (message.includes('User already registered') || message.includes('already exists')) {
    return 'An account with this email address already exists.';
  }
  if (message.includes('Password should be at least')) {
    return 'Your password must be at least 6 characters long.';
  }
  if (message.includes('Network request failed') || message.includes('fetch failed')) {
    return "We couldn't connect to WealthFlow. Please check your network connection and try again.";
  }
  if (message.includes('violates unique constraint') || message.includes('budgets_user_id_category_id_period_key')) {
    return 'A budget already exists for this category.';
  }
  if (message.includes('Goal not found or unauthorized') || message.includes('Unauthorized')) {
    return 'You are not authorized to modify this item.';
  }
  if (message.includes('Contribution amount must be greater than zero')) {
    return 'Please enter a valid contribution amount greater than $0.';
  }

  // 3. Technical database / PostgREST / internal details sanitization
  // Ensure raw SQL, PostgREST internal error codes, Postgres internal tables or stack traces are not leaked
  if (
    upperCode.startsWith('PGRST') ||
    upperCode.startsWith('42') ||
    upperCode.startsWith('28') ||
    lowerMsg.includes('relation "') ||
    lowerMsg.includes('syntax error at') ||
    lowerMsg.includes('pg_') ||
    lowerMsg.includes('violates foreign key constraint') ||
    lowerMsg.includes('column does not exist') ||
    lowerMsg.includes('syntax error') ||
    lowerMsg.includes('pgrst') ||
    (lowerMsg.includes('at ') && lowerMsg.includes('.js:'))
  ) {
    return 'An unexpected database error occurred. Please try again.';
  }

  return message || 'Something went wrong. Please try again.';
}
