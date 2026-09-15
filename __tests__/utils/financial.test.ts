import {
  calculateTotalBalance,
  calculateMonthlyIncome,
  calculateMonthlyExpenses,
  getBudgetStatus,
  calculateCategorySpending,
  calculateMonthlyTrends,
  generateFinancialInsights,
} from '../../src/utils/financial';
import { Transaction, Budget, SavingsGoal, Category } from '../../src/types/financial';

const createSampleTransaction = (overrides?: Partial<Transaction>): Transaction => ({
  id: 'tx_1',
  userId: 'usr_1',
  categoryId: 'c0000000-0000-4000-8000-000000000010', // Food & Dining
  categoryName: 'Food & Dining',
  categoryIcon: 'utensils',
  categoryColor: '#F59E0B',
  type: 'expense',
  amount: 50,
  merchant: 'Grocery Store',
  description: 'Weekly groceries',
  date: '2026-09-15',
  createdAt: '2026-09-15T10:00:00.000Z',
  updatedAt: '2026-09-15T10:00:00.000Z',
  ...overrides,
});

describe('src/utils/financial.ts', () => {
  describe('calculateTotalBalance', () => {
    it('calculates total balance as income minus expenses plus base savings', () => {
      const txs: Transaction[] = [
        createSampleTransaction({ id: '1', type: 'income', amount: 3000 }),
        createSampleTransaction({ id: '2', type: 'expense', amount: 1000 }),
        createSampleTransaction({ id: '3', type: 'expense', amount: 500 }),
      ];
      // 3000 - 1500 + 200 = 1700
      expect(calculateTotalBalance(txs, 200)).toBe(1700);
    });

    it('returns base savings when transaction list is empty', () => {
      expect(calculateTotalBalance([], 500)).toBe(500);
      expect(calculateTotalBalance([], 0)).toBe(0);
    });

    it('calculates correctly when only income transactions exist', () => {
      const txs: Transaction[] = [
        createSampleTransaction({ id: '1', type: 'income', amount: 2500 }),
        createSampleTransaction({ id: '2', type: 'income', amount: 500 }),
      ];
      expect(calculateTotalBalance(txs, 0)).toBe(3000);
    });

    it('calculates correctly when only expense transactions exist', () => {
      const txs: Transaction[] = [
        createSampleTransaction({ id: '1', type: 'expense', amount: 400 }),
        createSampleTransaction({ id: '2', type: 'expense', amount: 600 }),
      ];
      expect(calculateTotalBalance(txs, 0)).toBe(-1000);
    });

    it('allows negative resulting balance when expenses exceed income and savings', () => {
      const txs: Transaction[] = [
        createSampleTransaction({ id: '1', type: 'income', amount: 1000 }),
        createSampleTransaction({ id: '2', type: 'expense', amount: 1500 }),
      ];
      expect(calculateTotalBalance(txs, 200)).toBe(-300);
    });
  });

  describe('calculateMonthlyIncome and calculateMonthlyExpenses', () => {
    const transactions: Transaction[] = [
      createSampleTransaction({ id: '1', type: 'income', amount: 4000, date: '2026-09-01' }),
      createSampleTransaction({ id: '2', type: 'income', amount: 1000, date: '2026-09-15' }),
      createSampleTransaction({ id: '3', type: 'income', amount: 3000, date: '2026-08-25' }), // Previous month
      createSampleTransaction({ id: '4', type: 'expense', amount: 800, date: '2026-09-05' }),
      createSampleTransaction({ id: '5', type: 'expense', amount: 450, date: '2026-09-20' }),
      createSampleTransaction({ id: '6', type: 'expense', amount: 900, date: '2026-08-10' }), // Previous month
    ];

    it('calculateMonthlyIncome includes only income for the target month', () => {
      expect(calculateMonthlyIncome(transactions, '2026-09')).toBe(5000);
      expect(calculateMonthlyIncome(transactions, '2026-08')).toBe(3000);
      expect(calculateMonthlyIncome(transactions, '2026-07')).toBe(0);
    });

    it('calculateMonthlyExpenses includes only expenses for the target month', () => {
      expect(calculateMonthlyExpenses(transactions, '2026-09')).toBe(1250);
      expect(calculateMonthlyExpenses(transactions, '2026-08')).toBe(900);
      expect(calculateMonthlyExpenses(transactions, '2026-07')).toBe(0);
    });

    it('defaults to current local month when targetYearMonth is omitted', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date(2026, 8, 15, 23, 30, 0)); // September 15, 2026 local time
      expect(calculateMonthlyIncome(transactions)).toBe(5000);
      expect(calculateMonthlyExpenses(transactions)).toBe(1250);
      jest.useRealTimers();
    });
  });

  describe('getBudgetStatus', () => {
    it('returns "healthy" when spent ratio is strictly below 80%', () => {
      expect(getBudgetStatus(0, 1000)).toBe('healthy');
      expect(getBudgetStatus(799, 1000)).toBe('healthy');
    });

    it('returns "warning" at exactly 80% and up to 99%', () => {
      expect(getBudgetStatus(800, 1000)).toBe('warning');
      expect(getBudgetStatus(990, 1000)).toBe('warning');
      expect(getBudgetStatus(999.9, 1000)).toBe('warning');
    });

    it('returns "over_budget" at exactly 100% and above', () => {
      expect(getBudgetStatus(1000, 1000)).toBe('over_budget');
      expect(getBudgetStatus(1500, 1000)).toBe('over_budget');
    });

    it('returns "healthy" for zero or negative limits to prevent invalid divisions', () => {
      expect(getBudgetStatus(100, 0)).toBe('healthy');
      expect(getBudgetStatus(100, -500)).toBe('healthy');
    });
  });

  describe('calculateCategorySpending', () => {
    const testCategories: Category[] = [
      { id: 'c0000000-0000-4000-8000-000000000010', slug: 'food_dining', name: 'Food & Dining', type: 'expense', icon: 'utensils', color: '#F59E0B' },
      { id: 'c0000000-0000-4000-8000-000000000011', slug: 'transport', name: 'Transport', type: 'expense', icon: 'car', color: '#3B82F6' },
      { id: 'c0000000-0000-4000-8000-000000000012', slug: 'shopping', name: 'Shopping', type: 'expense', icon: 'shopping-bag', color: '#EC4899' },
    ];

    it('aggregates spending, resolves legacy IDs, sorts descending, and calculates percentage shares', () => {
      const txs: Transaction[] = [
        // Canonical food ID: 600
        createSampleTransaction({ id: '1', categoryId: 'c0000000-0000-4000-8000-000000000010', amount: 400, date: '2026-09-02' }),
        // Legacy cat_food ID (resolves to canonical food): 200 -> total food = 600
        createSampleTransaction({ id: '2', categoryId: 'cat_food', amount: 200, date: '2026-09-04' }),
        // Transport: 400
        createSampleTransaction({ id: '3', categoryId: 'c0000000-0000-4000-8000-000000000011', amount: 400, date: '2026-09-10' }),
        // Income transaction in same month: must be excluded
        createSampleTransaction({ id: '4', type: 'income', amount: 5000, date: '2026-09-01' }),
        // Expense in different month: must be excluded
        createSampleTransaction({ id: '5', categoryId: 'c0000000-0000-4000-8000-000000000012', amount: 500, date: '2026-08-15' }),
      ];

      // Total target month expense = 600 (food) + 400 (transport) = 1000
      const spending = calculateCategorySpending(txs, testCategories, '2026-09');

      expect(spending).toHaveLength(2); // Shopping has 0 spend, so it is excluded
      expect(spending[0].categoryName).toBe('Food & Dining');
      expect(spending[0].amount).toBe(600);
      expect(spending[0].percentage).toBe(60); // 600/1000 = 60%

      expect(spending[1].categoryName).toBe('Transport');
      expect(spending[1].amount).toBe(400);
      expect(spending[1].percentage).toBe(40); // 400/1000 = 40%
    });

    it('defaults to current local month when targetYearMonth is omitted', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date(2026, 8, 15, 23, 30, 0));

      const txs: Transaction[] = [
        createSampleTransaction({ id: '1', categoryId: 'c0000000-0000-4000-8000-000000000010', amount: 500, date: '2026-09-02' }),
        createSampleTransaction({ id: '2', categoryId: 'c0000000-0000-4000-8000-000000000010', amount: 300, date: '2026-08-15' }),
      ];

      const spending = calculateCategorySpending(txs, testCategories);
      expect(spending).toHaveLength(1);
      expect(spending[0].amount).toBe(500);

      jest.useRealTimers();
    });
  });

  describe('calculateMonthlyTrends', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date(2026, 8, 15)); // September 2026
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('produces a rolling 6-month array with accurate income, expenses, and savings', () => {
      const txs: Transaction[] = [
        createSampleTransaction({ type: 'income', amount: 3000, date: '2026-09-10' }),
        createSampleTransaction({ type: 'expense', amount: 1000, date: '2026-09-12' }),
        createSampleTransaction({ type: 'income', amount: 2500, date: '2026-08-01' }),
        createSampleTransaction({ type: 'expense', amount: 3000, date: '2026-08-05' }), // Expenses exceed income
      ];

      const trends = calculateMonthlyTrends(txs);
      expect(trends).toHaveLength(6);

      // Last element is current month (September)
      const currentMonthTrend = trends[trends.length - 1];
      expect(currentMonthTrend.month).toBe('Sep');
      expect(currentMonthTrend.income).toBe(3000);
      expect(currentMonthTrend.expenses).toBe(1000);
      expect(currentMonthTrend.savings).toBe(2000); // 3000 - 1000

      // Penultimate element is August
      const augTrend = trends[trends.length - 2];
      expect(augTrend.month).toBe('Aug');
      expect(augTrend.income).toBe(2500);
      expect(augTrend.expenses).toBe(3000);
      expect(augTrend.savings).toBe(0); // Math.max(0, 2500 - 3000)
    });
  });

  describe('generateFinancialInsights', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date(2026, 8, 15)); // September 2026
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('generates a strong savings rate insight when savings rate >= 20%', () => {
      const txs: Transaction[] = [
        createSampleTransaction({ type: 'income', amount: 5000, date: '2026-09-01' }),
        createSampleTransaction({ type: 'expense', amount: 2000, date: '2026-09-05' }), // Saves 60%
      ];
      const insights = generateFinancialInsights(txs, [], []);
      const savingsInsight = insights.find((i) => i.id === 'ins_savings_rate_good');
      expect(savingsInsight).toBeDefined();
      expect(savingsInsight?.type).toBe('positive');
      expect(savingsInsight?.impactPercentage).toBe(60);
    });

    it('generates a warning when expenses exceed income', () => {
      const txs: Transaction[] = [
        createSampleTransaction({ type: 'income', amount: 2000, date: '2026-09-01' }),
        createSampleTransaction({ type: 'expense', amount: 3000, date: '2026-09-05' }),
      ];
      const insights = generateFinancialInsights(txs, [], []);
      const warnInsight = insights.find((i) => i.id === 'ins_savings_rate_negative');
      expect(warnInsight).toBeDefined();
      expect(warnInsight?.type).toBe('warning');
    });

    it('generates an over budget alert when active budgets are exceeded', () => {
      const budgets: Budget[] = [
        {
          id: 'bgt_1',
          userId: 'usr_1',
          categoryId: 'c0000000-0000-4000-8000-000000000010',
          categoryName: 'Food & Dining',
          limit: 500,
          spent: 650, // Exceeded
          amount: 500,
          period: 'monthly',
          createdAt: '',
          updatedAt: '',
        },
      ];
      const insights = generateFinancialInsights([], budgets, []);
      const overBudgetInsight = insights.find((i) => i.id === 'ins_over_budget');
      expect(overBudgetInsight).toBeDefined();
      expect(overBudgetInsight?.type).toBe('warning');
    });

    it('generates a savings goal milestone progress insight', () => {
      const goals: SavingsGoal[] = [
        {
          id: 'goal_1',
          userId: 'usr_1',
          name: 'Emergency Fund',
          targetAmount: 10000,
          currentAmount: 5000, // 50%
          targetDate: '2027-01-01',
          monthlyContribution: 500,
          color: '#3B82F6',
          icon: 'Shield',
          createdAt: '',
          updatedAt: '',
        },
      ];
      const insights = generateFinancialInsights([], [], goals);
      const goalInsight = insights.find((i) => i.id === 'ins_savings_goal');
      expect(goalInsight).toBeDefined();
      expect(goalInsight?.impactPercentage).toBe(50);
      expect(goalInsight?.message).toContain('50%');
    });
  });
});
