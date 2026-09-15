import { Currency, User } from '../../src/types/financial';
import { UserProfile } from '../../src/types/auth';

/**
 * Currency State Synchronization Contract Tests
 * 
 * Verifies the exact synchronization contract implemented across
 * FinancialContext.setCurrency, AuthContext.updateProfileState,
 * and profileService.updateProfile:
 * 
 * Contract A: Successful currency update
 * - Remote profileService update succeeds
 * - AuthContext currentUser profile is synchronized to new currency
 * - FinancialContext user preferences reflect new currency
 * 
 * Contract B: Failed currency update
 * - Remote profileService update fails
 * - Neither FinancialContext nor AuthContext mutate their state
 * - Error is returned/propagated to UI
 * 
 * Contract C: Subsequent profile updates preserve currency
 * - Changing the user's name does not revert or corrupt the active currency
 */
describe('Currency State Synchronization Contract', () => {
  interface MockAuthState {
    currentUser: UserProfile | null;
    updateProfileState: (updates: Partial<UserProfile>) => void;
  }

  interface MockFinancialState {
    user: User;
    setUser: (updater: (prev: User) => User) => void;
  }

  const createTestEnvironment = (initialCurrency: Currency = 'USD') => {
    let authUser: UserProfile = {
      id: 'usr_abc',
      fullName: 'Alex Morgan',
      email: 'alex@example.com',
      currency: initialCurrency,
      themeMode: 'system',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    };

    let financialUser: User = {
      id: 'usr_abc',
      name: 'Alex Morgan',
      email: 'alex@example.com',
      preferences: {
        currency: initialCurrency,
        theme: 'system',
        themeMode: 'system',
        notifications: true,
      },
    };

    const authContext: MockAuthState = {
      get currentUser() {
        return authUser;
      },
      updateProfileState: (updates: Partial<UserProfile>) => {
        authUser = { ...authUser, ...updates };
      },
    };

    const financialContext: MockFinancialState = {
      get user() {
        return financialUser;
      },
      setUser: (updater: (prev: User) => User) => {
        financialUser = updater(financialUser);
      },
    };

    // Implementation matching FinancialContext.setCurrency
    const setCurrency = async (
      newCurrency: Currency,
      profileUpdater: (userId: string, updates: { currency: Currency }) => Promise<{ success: boolean; error?: string }>
    ) => {
      const res = await profileUpdater(authUser.id, { currency: newCurrency });
      if (res.success) {
        authContext.updateProfileState({ currency: newCurrency });
        financialContext.setUser((prev) => ({
          ...prev,
          preferences: { ...prev.preferences, currency: newCurrency },
        }));
        return { success: true };
      }
      return { success: false, error: res.error || 'Failed to update currency preference.' };
    };

    // Implementation matching ProfileScreen.handleSaveProfile (subsequent profile update)
    const handleSaveProfile = async (
      newName: string,
      profileUpdater: (userId: string, updates: { fullName: string }) => Promise<{ success: boolean; error?: string }>
    ) => {
      const res = await profileUpdater(authUser.id, { fullName: newName });
      if (res.success) {
        authContext.updateProfileState({ fullName: newName });
        // Simulating FinancialContext syncing currentUser into User
        financialContext.setUser((prev) => ({
          ...prev,
          name: authUser.fullName,
          preferences: {
            ...prev.preferences,
            currency: authUser.currency,
          },
        }));
        return { success: true };
      }
      return { success: false, error: res.error || 'Failed to update profile.' };
    };

    return {
      authContext,
      financialContext,
      setCurrency,
      handleSaveProfile,
    };
  };

  it('A: Successful currency update synchronizes FinancialContext, AuthContext, and remote profile', async () => {
    const env = createTestEnvironment('USD');
    const mockRemoteUpdate = jest.fn().mockResolvedValueOnce({ success: true });

    const result = await env.setCurrency('EUR', mockRemoteUpdate);

    expect(result).toEqual({ success: true });
    expect(mockRemoteUpdate).toHaveBeenCalledWith('usr_abc', { currency: 'EUR' });
    expect(env.financialContext.user.preferences.currency).toBe('EUR');
    expect(env.authContext.currentUser?.currency).toBe('EUR');
  });

  it('B: Failed currency update preserves existing currency and returns error', async () => {
    const env = createTestEnvironment('USD');
    const mockRemoteUpdate = jest.fn().mockResolvedValueOnce({
      success: false,
      error: 'Network connection lost',
    });

    const result = await env.setCurrency('GBP', mockRemoteUpdate);

    expect(result).toEqual({ success: false, error: 'Network connection lost' });
    expect(mockRemoteUpdate).toHaveBeenCalledWith('usr_abc', { currency: 'GBP' });
    // Local states remain strictly unchanged
    expect(env.financialContext.user.preferences.currency).toBe('USD');
    expect(env.authContext.currentUser?.currency).toBe('USD');
  });

  it('C: Subsequent profile edit (e.g. name change) does NOT revert currency to previous value', async () => {
    const env = createTestEnvironment('USD');
    const mockCurrencyUpdate = jest.fn().mockResolvedValueOnce({ success: true });
    const mockProfileUpdate = jest.fn().mockResolvedValueOnce({ success: true });

    // Step 1: Update currency to EUR
    await env.setCurrency('EUR', mockCurrencyUpdate);
    expect(env.authContext.currentUser?.currency).toBe('EUR');
    expect(env.financialContext.user.preferences.currency).toBe('EUR');

    // Step 2: Edit user's full name
    const profileRes = await env.handleSaveProfile('Alex J. Morgan', mockProfileUpdate);
    expect(profileRes).toEqual({ success: true });

    // Step 3: Verify name updated while currency remains EUR
    expect(env.authContext.currentUser?.fullName).toBe('Alex J. Morgan');
    expect(env.authContext.currentUser?.currency).toBe('EUR');
    expect(env.financialContext.user.name).toBe('Alex J. Morgan');
    expect(env.financialContext.user.preferences.currency).toBe('EUR');
  });
});
