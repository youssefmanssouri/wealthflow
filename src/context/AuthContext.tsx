import React, { createContext, useContext, useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase, getFriendlyErrorMessage } from '../services/supabase';
import { profileService } from '../services/profileService';
import { AuthContextType, UserProfile } from '../types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Synchronize profile details when session changes
  const loadUserProfile = async (userId: string, email: string) => {
    const profile = await profileService.fetchProfile(userId);
    if (profile) {
      setCurrentUser(profile);
    } else {
      setCurrentUser({
        id: userId,
        fullName: 'WealthFlow User',
        email,
        currency: 'USD',
        themeMode: 'system',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  };

  useEffect(() => {
    // 1. Initial Session Restoration
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        loadUserProfile(session.user.id, session.user.email || '');
      }
      setIsLoading(false);
    });

    // 2. Auth State Subscription Listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session?.user) {
        await loadUserProfile(session.user.id, session.user.email || '');
      } else {
        setCurrentUser(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      
      if (data.session?.user) {
        await loadUserProfile(data.session.user.id, data.session.user.email || email);
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: getFriendlyErrorMessage(err) };
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (fullName: string, email: string, password: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      });

      if (error) throw error;

      if (data.user) {
        await profileService.updateProfile(data.user.id, { fullName });
        await loadUserProfile(data.user.id, email);
      }

      return { success: true };
    } catch (err) {
      return { success: false, error: getFriendlyErrorMessage(err) };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      await supabase.auth.signOut();
      setSession(null);
      setCurrentUser(null);
    } catch (err) {
      console.warn('Sign out warning:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      return { success: true };
    } catch (err) {
      return { success: false, error: getFriendlyErrorMessage(err) };
    }
  };

  const updateProfileState = (updates: Partial<UserProfile>) => {
    setCurrentUser((prev) => (prev ? { ...prev, ...updates } : null));
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        session,
        isLoading,
        isAuthenticated: !!session?.user,
        signIn,
        signUp,
        signOut,
        resetPassword,
        updateProfileState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
