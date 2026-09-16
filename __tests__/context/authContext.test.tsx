import React from 'react';
// @ts-ignore
import ReactTestRenderer, { act } from 'react-test-renderer';
import { AuthProvider, useAuth } from '../../src/context/AuthContext';
import { supabase } from '../../src/services/supabase';
import { profileService } from '../../src/services/profileService';
import { AuthContextType } from '../../src/types/auth';

// Mock Supabase & profileService
jest.mock('../../src/services/supabase', () => {
  const actual = jest.requireActual('../../src/services/supabase');
  return {
    supabase: {
      auth: {
        getSession: jest.fn(),
        onAuthStateChange: jest.fn(),
        signInWithPassword: jest.fn(),
        signUp: jest.fn(),
        signOut: jest.fn(),
        resetPasswordForEmail: jest.fn(),
      },
    },
    getFriendlyErrorMessage: actual.getFriendlyErrorMessage,
  };
});

jest.mock('../../src/services/profileService', () => ({
  profileService: {
    fetchProfile: jest.fn(),
    updateProfile: jest.fn(),
    deleteAccount: jest.fn(),
  },
}));

// Test consumer to capture AuthContext value
const TestConsumer: React.FC<{ onAuth: (val: AuthContextType) => void }> = ({ onAuth }) => {
  const auth = useAuth();
  onAuth(auth);
  return null;
};

describe('src/context/AuthContext.tsx', () => {
  let authListenerCallback: (event: string, session: any) => Promise<void>;
  const mockUnsubscribe = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (supabase.auth.onAuthStateChange as jest.Mock).mockImplementation((callback) => {
      authListenerCallback = callback;
      return {
        data: {
          subscription: {
            unsubscribe: mockUnsubscribe,
          },
        },
      };
    });
  });

  it('Test A — Existing session hydration: loads profile once and sets authenticated state', async () => {
    const mockSession = {
      user: { id: 'usr_1', email: 'alice@example.com' },
      access_token: 'tok_1',
    };

    (supabase.auth.getSession as jest.Mock).mockResolvedValueOnce({
      data: { session: mockSession },
    });

    (profileService.fetchProfile as jest.Mock).mockResolvedValueOnce({
      id: 'usr_1',
      fullName: 'Alice Walker',
      email: 'alice@example.com',
      currency: 'USD',
      themeMode: 'system',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    });

    let currentAuth: AuthContextType | null = null;
    await act(async () => {
      ReactTestRenderer.create(
        <AuthProvider>
          <TestConsumer onAuth={(val) => { currentAuth = val; }} />
        </AuthProvider>
      );
    });

    // Wait microtasks for getSession & loadUserProfile to finish
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(currentAuth!.isInitializing).toBe(false);
    expect(currentAuth!.isAuthenticated).toBe(true);
    expect(currentAuth!.session).toEqual(mockSession);
    expect(currentAuth!.currentUser?.fullName).toBe('Alice Walker');
    expect(profileService.fetchProfile).toHaveBeenCalledTimes(1);
    expect(profileService.fetchProfile).toHaveBeenCalledWith('usr_1');
  });

  it('Test B — No session: initializes with null session and no profile request', async () => {
    (supabase.auth.getSession as jest.Mock).mockResolvedValueOnce({
      data: { session: null },
    });

    let currentAuth: AuthContextType | null = null;
    await act(async () => {
      ReactTestRenderer.create(
        <AuthProvider>
          <TestConsumer onAuth={(val) => { currentAuth = val; }} />
        </AuthProvider>
      );
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(currentAuth!.isInitializing).toBe(false);
    expect(currentAuth!.isAuthenticated).toBe(false);
    expect(currentAuth!.session).toBeNull();
    expect(currentAuth!.currentUser).toBeNull();
    expect(profileService.fetchProfile).not.toHaveBeenCalled();
  });

  it('Test C — SIGNED_OUT: clears session and currentUser', async () => {
    const mockSession = {
      user: { id: 'usr_1', email: 'alice@example.com' },
    };

    (supabase.auth.getSession as jest.Mock).mockResolvedValueOnce({
      data: { session: mockSession },
    });

    (profileService.fetchProfile as jest.Mock).mockResolvedValueOnce({
      id: 'usr_1',
      fullName: 'Alice',
      email: 'alice@example.com',
    });

    let currentAuth: AuthContextType | null = null;
    await act(async () => {
      ReactTestRenderer.create(
        <AuthProvider>
          <TestConsumer onAuth={(val) => { currentAuth = val; }} />
        </AuthProvider>
      );
    });

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(currentAuth!.isAuthenticated).toBe(true);

    // Fire SIGNED_OUT event via listener
    await act(async () => {
      await authListenerCallback('SIGNED_OUT', null);
    });

    expect(currentAuth!.isAuthenticated).toBe(false);
    expect(currentAuth!.session).toBeNull();
    expect(currentAuth!.currentUser).toBeNull();
  });

  it('Test D — SIGNED_IN: updates session and loads the new user profile', async () => {
    (supabase.auth.getSession as jest.Mock).mockResolvedValueOnce({
      data: { session: null },
    });

    let currentAuth: AuthContextType | null = null;
    await act(async () => {
      ReactTestRenderer.create(
        <AuthProvider>
          <TestConsumer onAuth={(val) => { currentAuth = val; }} />
        </AuthProvider>
      );
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(currentAuth!.isInitializing).toBe(false);

    const newSession = {
      user: { id: 'usr_2', email: 'bob@example.com' },
    };

    (profileService.fetchProfile as jest.Mock).mockResolvedValueOnce({
      id: 'usr_2',
      fullName: 'Bob Smith',
      email: 'bob@example.com',
    });

    await act(async () => {
      await authListenerCallback('SIGNED_IN', newSession);
    });

    expect(currentAuth!.isAuthenticated).toBe(true);
    expect(currentAuth!.session).toEqual(newSession);
    expect(currentAuth!.currentUser?.fullName).toBe('Bob Smith');
    expect(profileService.fetchProfile).toHaveBeenCalledWith('usr_2');
  });

  it('Test E — Signup with immediate session: supplies metadata and does NOT call redundant updateProfile', async () => {
    (supabase.auth.getSession as jest.Mock).mockResolvedValueOnce({
      data: { session: null },
    });

    const mockNewSession = {
      user: { id: 'usr_3', email: 'new@example.com' },
    };

    (supabase.auth.signUp as jest.Mock).mockResolvedValueOnce({
      data: {
        user: mockNewSession.user,
        session: mockNewSession,
      },
      error: null,
    });

    (profileService.fetchProfile as jest.Mock).mockResolvedValueOnce({
      id: 'usr_3',
      fullName: 'New User',
      email: 'new@example.com',
    });

    let currentAuth: AuthContextType | null = null;
    await act(async () => {
      ReactTestRenderer.create(
        <AuthProvider>
          <TestConsumer onAuth={(val) => { currentAuth = val; }} />
        </AuthProvider>
      );
    });

    await act(async () => {
      await Promise.resolve();
    });

    let res: any;
    await act(async () => {
      res = await currentAuth!.signUp('New User', 'new@example.com', 'password123');
    });

    expect(res).toEqual({ success: true, confirmationRequired: false });
    expect(supabase.auth.signUp).toHaveBeenCalledWith({
      email: 'new@example.com',
      password: 'password123',
      options: {
        data: { full_name: 'New User' },
      },
    });

    // Invariant: no redundant client-side updateProfile is triggered
    expect(profileService.updateProfile).not.toHaveBeenCalled();
    expect(currentAuth!.isAuthenticated).toBe(true);
    expect(currentAuth!.currentUser?.fullName).toBe('New User');
  });

  it('Test F — Signup requiring email confirmation: returns confirmationRequired without session', async () => {
    (supabase.auth.getSession as jest.Mock).mockResolvedValueOnce({
      data: { session: null },
    });

    (supabase.auth.signUp as jest.Mock).mockResolvedValueOnce({
      data: {
        user: { id: 'usr_4', email: 'pending@example.com' },
        session: null,
      },
      error: null,
    });

    let currentAuth: AuthContextType | null = null;
    await act(async () => {
      ReactTestRenderer.create(
        <AuthProvider>
          <TestConsumer onAuth={(val) => { currentAuth = val; }} />
        </AuthProvider>
      );
    });

    await act(async () => {
      await Promise.resolve();
    });

    let res: any;
    await act(async () => {
      res = await currentAuth!.signUp('Pending User', 'pending@example.com', 'password123');
    });

    expect(res).toEqual({ success: true, confirmationRequired: true });
    expect(currentAuth!.isAuthenticated).toBe(false);
    expect(currentAuth!.session).toBeNull();
    expect(profileService.updateProfile).not.toHaveBeenCalled();
  });

  it('Test G — Unexpected session invalidation sets sessionExpiredMessage', async () => {
    const mockSession = {
      user: { id: 'usr_5', email: 'eve@example.com' },
    };

    (supabase.auth.getSession as jest.Mock).mockResolvedValueOnce({
      data: { session: mockSession },
    });

    (profileService.fetchProfile as jest.Mock).mockResolvedValueOnce({
      id: 'usr_5',
      fullName: 'Eve',
      email: 'eve@example.com',
    });

    let currentAuth: AuthContextType | null = null;
    await act(async () => {
      ReactTestRenderer.create(
        <AuthProvider>
          <TestConsumer onAuth={(val) => { currentAuth = val; }} />
        </AuthProvider>
      );
    });

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(currentAuth!.isAuthenticated).toBe(true);
    expect(currentAuth!.sessionExpiredMessage).toBeNull();

    // Fire unexpected SIGNED_OUT event
    await act(async () => {
      await authListenerCallback('SIGNED_OUT', null);
    });

    expect(currentAuth!.isAuthenticated).toBe(false);
    expect(currentAuth!.session).toBeNull();
    expect(currentAuth!.sessionExpiredMessage).toBe('Your session expired. Please sign in again.');

    // Clear notification
    act(() => {
      currentAuth!.clearSessionExpiredMessage();
    });
    expect(currentAuth!.sessionExpiredMessage).toBeNull();
  });

  it('Test H — Intentional sign-out does NOT produce sessionExpiredMessage', async () => {
    const mockSession = {
      user: { id: 'usr_6', email: 'frank@example.com' },
    };

    (supabase.auth.getSession as jest.Mock).mockResolvedValueOnce({
      data: { session: mockSession },
    });

    (profileService.fetchProfile as jest.Mock).mockResolvedValueOnce({
      id: 'usr_6',
      fullName: 'Frank',
      email: 'frank@example.com',
    });

    (supabase.auth.signOut as jest.Mock).mockResolvedValueOnce({ error: null });

    let currentAuth: AuthContextType | null = null;
    await act(async () => {
      ReactTestRenderer.create(
        <AuthProvider>
          <TestConsumer onAuth={(val) => { currentAuth = val; }} />
        </AuthProvider>
      );
    });

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(currentAuth!.isAuthenticated).toBe(true);

    // Call intentional signOut()
    await act(async () => {
      await currentAuth!.signOut();
    });

    // Fire SIGNED_OUT from listener following signOut
    await act(async () => {
      await authListenerCallback('SIGNED_OUT', null);
    });

    expect(currentAuth!.isAuthenticated).toBe(false);
    expect(currentAuth!.session).toBeNull();
    expect(currentAuth!.sessionExpiredMessage).toBeNull();
  });

  it('Test I — Initial unauthenticated startup does NOT produce sessionExpiredMessage', async () => {
    (supabase.auth.getSession as jest.Mock).mockResolvedValueOnce({
      data: { session: null },
    });

    let currentAuth: AuthContextType | null = null;
    await act(async () => {
      ReactTestRenderer.create(
        <AuthProvider>
          <TestConsumer onAuth={(val) => { currentAuth = val; }} />
        </AuthProvider>
      );
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(currentAuth!.isAuthenticated).toBe(false);
    expect(currentAuth!.sessionExpiredMessage).toBeNull();
  });
});
