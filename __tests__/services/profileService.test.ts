import { profileService } from '../../src/services/profileService';
import { supabase } from '../../src/services/supabase';

// Mock Supabase singleton
jest.mock('../../src/services/supabase', () => {
  const actualSupabase = jest.requireActual('../../src/services/supabase');
  return {
    supabase: {
      from: jest.fn(),
      rpc: jest.fn(),
    },
    getFriendlyErrorMessage: actualSupabase.getFriendlyErrorMessage,
  };
});

describe('src/services/profileService.ts - deleteAccount', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns success: true when delete_user_account RPC confirms success', async () => {
    (supabase.rpc as jest.Mock).mockResolvedValueOnce({
      data: { success: true },
      error: null,
    });

    const result = await profileService.deleteAccount();

    expect(supabase.rpc).toHaveBeenCalledWith('delete_user_account');
    expect(result).toEqual({ success: true });
  });

  it('returns failure when delete_user_account RPC returns success: false with error message', async () => {
    (supabase.rpc as jest.Mock).mockResolvedValueOnce({
      data: { success: false, error: 'Database constraint' },
      error: null,
    });

    const result = await profileService.deleteAccount();

    expect(supabase.rpc).toHaveBeenCalledWith('delete_user_account');
    expect(result).toEqual({
      success: false,
      error: 'Database constraint',
    });
  });

  it('protects against ambiguous null response by returning failure instead of success', async () => {
    (supabase.rpc as jest.Mock).mockResolvedValueOnce({
      data: null,
      error: null,
    });

    const result = await profileService.deleteAccount();

    expect(supabase.rpc).toHaveBeenCalledWith('delete_user_account');
    expect(result).toEqual({
      success: false,
      error: 'Failed to delete account.',
    });
  });

  it('catches thrown Supabase errors and returns user-friendly translated failure', async () => {
    (supabase.rpc as jest.Mock).mockResolvedValueOnce({
      data: null,
      error: { message: 'Network request failed' },
    });

    const result = await profileService.deleteAccount();

    expect(result.success).toBe(false);
    expect(result.error).toBe(
      "We couldn't connect to WealthFlow. Please check your network connection and try again."
    );
  });
});

describe('src/services/profileService.ts - fetchProfile & updateProfile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetchProfile returns formatted user profile when found', async () => {
    const mockQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValueOnce({
        data: {
          id: 'usr_123',
          full_name: 'Jane Doe',
          email: 'jane@example.com',
          currency: 'EUR',
          theme_mode: 'dark',
          created_at: '2026-01-01T00:00:00Z',
          updated_at: '2026-01-01T00:00:00Z',
        },
        error: null,
      }),
    };
    (supabase.from as jest.Mock).mockReturnValue(mockQuery);

    const profile = await profileService.fetchProfile('usr_123');

    expect(supabase.from).toHaveBeenCalledWith('profiles');
    expect(profile).toEqual({
      id: 'usr_123',
      fullName: 'Jane Doe',
      email: 'jane@example.com',
      currency: 'EUR',
      themeMode: 'dark',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    });
  });

  it('fetchProfile returns null when Supabase returns an error', async () => {
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    const mockQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValueOnce({
        data: null,
        error: { message: 'Row not found' },
      }),
    };
    (supabase.from as jest.Mock).mockReturnValue(mockQuery);

    const profile = await profileService.fetchProfile('non_existent');
    expect(profile).toBeNull();
  });
});
