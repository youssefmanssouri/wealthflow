import React, { createContext, useContext, useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase, getFriendlyErrorMessage } from '../services/supabase';
import { profileService } from '../services/profileService';
import { AuthContextType, UserProfile } from '../types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);

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
    let isMounted = true;

    // 1. Initial Session Restoration
    supabase.auth
      .getSession()
      .then(async ({ data: { session: initialSession } }) => {
        if (!isMounted) return;
        if (initialSession) {
          setSession(initialSession);
          if (initialSession.user) {
            await loadUserProfile(initialSession.user.id, initialSession.user.email || '');
          }
        }
        setIsInitializing(false);
      })
      .catch((err) => {
        console.warn('Session restoration warning:', err);
        if (isMounted) setIsInitializing(false);
      });

    // 2. Auth State Subscription Listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (!isMounted) return;
      setSession(newSession);
      if (newSession?.user) {
        await loadUserProfile(newSession.user.id, newSession.user.email || '');
      } else {
        setCurrentUser(null);
      }
      setIsInitializing(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      if (data.session) {
        setSession(data.session);
        if (data.session.user) {
          await loadUserProfile(data.session.user.id, data.session.user.email || email);
        }
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: getFriendlyErrorMessage(err) };
    }
  };

  const signUp = async (fullName: string, email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      });

      if (error) throw error;

      if (data.session) {
        setSession(data.session);
        if (data.user) {
          await profileService.updateProfile(data.user.id, { fullName });
          await loadUserProfile(data.user.id, email);
        }
        return { success: true, confirmationRequired: false };
      } else if (data.user) {
        return { success: true, confirmationRequired: true };
      }

      return { success: true };
    } catch (err) {
      return { success: false, error: getFriendlyErrorMessage(err) };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Sign out warning:', err);
    } finally {
      setSession(null);
      setCurrentUser(null);
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
        isLoading: isInitializing,
        isInitializing,
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
