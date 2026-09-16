import { savingsService } from '../../src/services/savingsService';
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

describe('src/services/savingsService.ts - fetchContributions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('successfully fetches and maps contribution records ordered descending', async () => {
    const mockContributionsData = [
      {
        id: 'contrib_1',
        user_id: 'usr_1',
        goal_id: 'goal_1',
        amount: 250.0,
        contribution_date: '2026-09-14T10:00:00.000Z',
        note: 'Monthly savings',
        created_at: '2026-09-14T10:00:00.000Z',
      },
      {
        id: 'contrib_2',
        user_id: 'usr_1',
        goal_id: 'goal_1',
        amount: 100.0,
        contribution_date: '2026-09-01T08:00:00.000Z',
        note: null,
        created_at: '2026-09-01T08:00:00.000Z',
      },
    ];

    const mockOrder = jest.fn().mockResolvedValueOnce({
      data: mockContributionsData,
      error: null,
    });

    const mockGoalEq = jest.fn().mockReturnValue({
      order: mockOrder,
    });

    const mockUserEq = jest.fn().mockReturnValue({
      eq: mockGoalEq,
    });

    const mockSelect = jest.fn().mockReturnValue({
      eq: mockUserEq,
    });

    (supabase.from as jest.Mock).mockReturnValue({
      select: mockSelect,
    });

    const result = await savingsService.fetchContributions('usr_1', 'goal_1');

    expect(supabase.from).toHaveBeenCalledWith('savings_contributions');
    expect(mockSelect).toHaveBeenCalledWith('*');
    expect(mockUserEq).toHaveBeenCalledWith('user_id', 'usr_1');
    expect(mockGoalEq).toHaveBeenCalledWith('goal_id', 'goal_1');
    expect(mockOrder).toHaveBeenCalledWith('contribution_date', { ascending: false });

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      id: 'contrib_1',
      userId: 'usr_1',
      goalId: 'goal_1',
      amount: 250.0,
      date: '2026-09-14T10:00:00.000Z',
      contributionDate: '2026-09-14T10:00:00.000Z',
      note: 'Monthly savings',
      createdAt: '2026-09-14T10:00:00.000Z',
    });
    expect(result[1]).toEqual({
      id: 'contrib_2',
      userId: 'usr_1',
      goalId: 'goal_1',
      amount: 100.0,
      date: '2026-09-01T08:00:00.000Z',
      contributionDate: '2026-09-01T08:00:00.000Z',
      note: undefined,
      createdAt: '2026-09-01T08:00:00.000Z',
    });
  });

  it('enforces isolation: queries strictly for the provided userId and goalId', async () => {
    const mockOrder = jest.fn().mockResolvedValueOnce({
      data: [],
      error: null,
    });
    const mockGoalEq = jest.fn().mockReturnValue({
      order: mockOrder,
    });
    const mockUserEq = jest.fn().mockReturnValue({
      eq: mockGoalEq,
    });
    const mockSelect = jest.fn().mockReturnValue({
      eq: mockUserEq,
    });
    (supabase.from as jest.Mock).mockReturnValue({
      select: mockSelect,
    });

    const result = await savingsService.fetchContributions('user_abc', 'goal_xyz');

    expect(mockUserEq).toHaveBeenCalledWith('user_id', 'user_abc');
    expect(mockGoalEq).toHaveBeenCalledWith('goal_id', 'goal_xyz');
    expect(result).toEqual([]);
  });

  it('surfaces database failure rather than converting it into an empty successful array', async () => {
    jest.spyOn(console, 'warn').mockImplementation(() => {});

    const mockOrder = jest.fn().mockResolvedValueOnce({
      data: null,
      error: { message: 'Database connection error' },
    });
    const mockGoalEq = jest.fn().mockReturnValue({
      order: mockOrder,
    });
    const mockUserEq = jest.fn().mockReturnValue({
      eq: mockGoalEq,
    });
    const mockSelect = jest.fn().mockReturnValue({
      eq: mockUserEq,
    });
    (supabase.from as jest.Mock).mockReturnValue({
      select: mockSelect,
    });

    await expect(savingsService.fetchContributions('usr_1', 'goal_1')).rejects.toThrow();
  });
});
