import {
  createExportPayload,
  ExportProfile,
  exportFinancialData,
  isShareDismissalError,
} from '../../src/utils/exportService';
import { Transaction, Budget, SavingsGoal } from '../../src/types/financial';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

jest.mock('expo-file-system', () => ({
  cacheDirectory: 'file:///mock-cache/',
  writeAsStringAsync: jest.fn().mockResolvedValue(undefined),
  getInfoAsync: jest.fn().mockResolvedValue({ exists: true }),
  EncodingType: { UTF8: 'utf8' },
}));

jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn().mockResolvedValue(true),
  shareAsync: jest.fn().mockResolvedValue(undefined),
}));

describe('src/utils/exportService.ts - createExportPayload', () => {
  const sampleTransactions: Transaction[] = [
    {
      id: 'tx_1',
      userId: 'usr_1',
      categoryId: 'cat_1',
      categoryName: 'Food',
      categoryIcon: 'utensils',
      categoryColor: '#F59E0B',
      type: 'expense',
      amount: 45.5,
      merchant: 'Market',
      description: 'Groceries',
      date: '2026-09-15',
      createdAt: '2026-09-15T10:00:00.000Z',
      updatedAt: '2026-09-15T10:00:00.000Z',
    },
  ];

  const sampleBudgets: Budget[] = [
    {
      id: 'bgt_1',
      userId: 'usr_1',
      categoryId: 'cat_1',
      categoryName: 'Food',
      limit: 500,
      spent: 45.5,
      amount: 500,
      period: 'monthly',
      createdAt: '2026-09-01T00:00:00.000Z',
      updatedAt: '2026-09-01T00:00:00.000Z',
    },
  ];

  const sampleSavingsGoals: SavingsGoal[] = [
    {
      id: 'goal_1',
      userId: 'usr_1',
      name: 'Emergency Fund',
      targetAmount: 5000,
      currentAmount: 1200,
      targetDate: '2026-12-31',
      monthlyContribution: 417,
      color: '#3B82F6',
      icon: 'Shield',
      createdAt: '2026-09-01T00:00:00.000Z',
      updatedAt: '2026-09-01T00:00:00.000Z',
    },
  ];

  it('generates correct top-level metadata', () => {
    const payload = createExportPayload({ name: 'Alice', email: 'alice@example.com', currency: 'USD' }, [], [], []);
    expect(payload.version).toBe('1.0');
    expect(payload.app).toBe('WealthFlow');
    expect(new Date(payload.exportedAt).toISOString()).toBe(payload.exportedAt);
  });

  it('preserves user profile and applies defaults when fields are omitted', () => {
    const fullProfile: ExportProfile = {
      name: 'Bob Smith',
      email: 'bob@example.com',
      currency: 'EUR',
    };
    const fullPayload = createExportPayload(fullProfile, [], [], []);
    expect(fullPayload.profile).toEqual({
      name: 'Bob Smith',
      email: 'bob@example.com',
      currency: 'EUR',
    });

    const emptyPayload = createExportPayload({}, [], [], []);
    expect(emptyPayload.profile).toEqual({
      name: 'WealthFlow User',
      email: '',
      currency: 'USD',
    });
  });

  it('preserves financial collections accurately', () => {
    const payload = createExportPayload(
      { name: 'Alice' },
      sampleTransactions,
      sampleBudgets,
      sampleSavingsGoals
    );

    expect(payload.transactions).toEqual(sampleTransactions);
    expect(payload.budgets).toEqual(sampleBudgets);
    expect(payload.savingsGoals).toEqual(sampleSavingsGoals);
  });

  it('safely converts null or undefined collection inputs to empty arrays', () => {
    const payload = createExportPayload(
      { name: 'Alice' },
      null as any,
      undefined as any,
      null as any
    );

    expect(payload.transactions).toEqual([]);
    expect(payload.budgets).toEqual([]);
    expect(payload.savingsGoals).toEqual([]);
  });

  it('does not expose credentials or security tokens in profile export', () => {
    const maliciousProfileInput = {
      name: 'Alice',
      email: 'alice@example.com',
      currency: 'USD',
      password: 'secret_password_123',
      token: 'jwt_token_sample',
      session: { user_id: '123' },
      access_token: 'access_token_123',
      refresh_token: 'refresh_token_123',
    };

    const payload = createExportPayload(maliciousProfileInput as any, [], [], []);

    expect((payload.profile as any).password).toBeUndefined();
    expect((payload.profile as any).token).toBeUndefined();
    expect((payload.profile as any).session).toBeUndefined();
    expect((payload.profile as any).access_token).toBeUndefined();
    expect((payload.profile as any).refresh_token).toBeUndefined();
    expect(Object.keys(payload.profile)).toEqual(['name', 'email', 'currency']);
  });

  it('includes real contribution records on savingsGoals when present', () => {
    const goalsWithContributions = [
      {
        ...sampleSavingsGoals[0],
        contributions: [
          {
            id: 'contrib_1',
            userId: 'usr_1',
            goalId: 'goal_1',
            amount: 500,
            date: '2026-09-10T12:00:00.000Z',
            contributionDate: '2026-09-10T12:00:00.000Z',
            note: 'Bonus deposit',
            createdAt: '2026-09-10T12:00:00.000Z',
          },
        ],
      },
    ];

    const payload = createExportPayload(
      { name: 'Alice' },
      sampleTransactions,
      sampleBudgets,
      goalsWithContributions
    );

    expect(payload.savingsGoals[0].contributions).toHaveLength(1);
    expect(payload.savingsGoals[0].contributions![0].id).toBe('contrib_1');
    expect(payload.savingsGoals[0].contributions![0].amount).toBe(500);
    expect(payload.savingsGoals[0].contributions![0].note).toBe('Bonus deposit');
  });

  it('does not fabricate contribution records from currentAmount when contributions are absent or empty', () => {
    // Goal has currentAmount: 1200, but empty/undefined contributions array
    const goalWithoutContributions = [
      {
        ...sampleSavingsGoals[0],
        currentAmount: 1200,
      },
    ];

    const payload = createExportPayload(
      { name: 'Alice' },
      [],
      [],
      goalWithoutContributions
    );

    expect(payload.savingsGoals[0].currentAmount).toBe(1200);
    expect(payload.savingsGoals[0].contributions).toBeUndefined();
    // Verify no fabricated contribution was inserted
    expect(payload.savingsGoals[0]).toEqual(sampleSavingsGoals[0]);
  });
});

describe('src/utils/exportService.ts - exportFinancialData & dismissal handling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ exists: true });
    (Sharing.isAvailableAsync as jest.Mock).mockResolvedValue(true);
    (Sharing.shareAsync as jest.Mock).mockResolvedValue(undefined);
  });

  it('isShareDismissalError correctly identifies cancellation/dismissal errors', () => {
    expect(isShareDismissalError(new Error('User did not share'))).toBe(true);
    expect(isShareDismissalError(new Error('Share dialog was cancelled'))).toBe(true);
    expect(isShareDismissalError('dismissed by user')).toBe(true);
    expect(isShareDismissalError(new Error('The user aborted the request'))).toBe(true);

    expect(isShareDismissalError(new Error('Permission denied'))).toBe(false);
    expect(isShareDismissalError(null)).toBe(false);
    expect(isShareDismissalError(undefined)).toBe(false);
  });

  it('handles user dismissal of the share sheet as a non-error outcome with dismissed=true', async () => {
    (Sharing.shareAsync as jest.Mock).mockRejectedValueOnce(new Error('The user cancelled the share operation'));

    const result = await exportFinancialData(
      { name: 'Alice', email: 'alice@example.com', currency: 'USD' },
      [],
      [],
      []
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.dismissed).toBe(true);
      expect(result.fileUri).toContain('wealthflow-export-');
    }
  });

  it('returns success=true and dismissed=false when sharing completes normally', async () => {
    const result = await exportFinancialData(
      { name: 'Alice', email: 'alice@example.com', currency: 'USD' },
      [],
      [],
      []
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.dismissed).toBe(false);
      expect(result.fileUri).toContain('wealthflow-export-');
    }
  });

  it('returns failure when genuine file writing error occurs', async () => {
    (FileSystem.writeAsStringAsync as jest.Mock).mockRejectedValueOnce(new Error('Disk write error'));

    const result = await exportFinancialData(
      { name: 'Alice', email: 'alice@example.com', currency: 'USD' },
      [],
      [],
      []
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('Failed to save export file');
    }
  });

  it('returns failure when sharing is unavailable on device', async () => {
    (Sharing.isAvailableAsync as jest.Mock).mockResolvedValueOnce(false);

    const result = await exportFinancialData(
      { name: 'Alice', email: 'alice@example.com', currency: 'USD' },
      [],
      [],
      []
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('File sharing is not supported or available');
    }
  });

  it('returns failure when sharing fails due to non-dismissal OS error', async () => {
    (Sharing.shareAsync as jest.Mock).mockRejectedValueOnce(new Error('Permission denied to open file'));

    const result = await exportFinancialData(
      { name: 'Alice', email: 'alice@example.com', currency: 'USD' },
      [],
      [],
      []
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('Permission denied to open file');
    }
  });
});
