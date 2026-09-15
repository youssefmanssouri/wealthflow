import { createExportPayload, ExportProfile } from '../../src/utils/exportService';
import { Transaction, Budget, SavingsGoal } from '../../src/types/financial';

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
});
