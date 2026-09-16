import {
  getIncomeExpenseChartSummary,
  getSpendingTrendChartSummary,
  getCategoryDonutChartSummary,
} from '../../src/utils/chartAccessibility';
import { MonthlyTrend, CategorySpending } from '../../src/types/financial';

describe('chartAccessibility utility', () => {
  describe('getIncomeExpenseChartSummary', () => {
    it('returns empty message when data is empty or undefined', () => {
      expect(getIncomeExpenseChartSummary([], 'USD')).toBe(
        'Income vs expense chart: No trend data available.'
      );
      expect(getIncomeExpenseChartSummary(undefined, 'USD')).toBe(
        'Income vs expense chart: No trend data available.'
      );
    });

    it('generates dynamic summary for single-month trend', () => {
      const data: MonthlyTrend[] = [{ month: 'Jan', income: 5000, expenses: 3000, savings: 0 }];
      const summary = getIncomeExpenseChartSummary(data, 'USD');

      expect(summary).toContain('Jan');
      expect(summary).toContain('$5,000');
      expect(summary).toContain('$3,000');
      expect(summary).toContain('+$2,000');
    });

    it('generates dynamic summary across multi-month period', () => {
      const data: MonthlyTrend[] = [
        { month: 'Jan', income: 4000, expenses: 2500, savings: 0 },
        { month: 'Feb', income: 4500, expenses: 3000, savings: 0 },
        { month: 'Mar', income: 5000, expenses: 3200, savings: 0 },
      ];
      const summary = getIncomeExpenseChartSummary(data, 'USD');

      expect(summary).toContain('Jan to Mar');
      expect(summary).toContain('$13,500'); // 4000 + 4500 + 5000
      expect(summary).toContain('$8,700'); // 2500 + 3000 + 3200
      expect(summary).toContain('+$4,800');
    });
  });

  describe('getSpendingTrendChartSummary', () => {
    it('returns empty message when data is empty or undefined', () => {
      expect(getSpendingTrendChartSummary([], 'USD')).toBe(
        'Spending trend chart: No trend data available.'
      );
      expect(getSpendingTrendChartSummary(undefined, 'USD')).toBe(
        'Spending trend chart: No trend data available.'
      );
    });

    it('generates spending trend with total and latest month', () => {
      const data: MonthlyTrend[] = [
        { month: 'Apr', income: 3000, expenses: 1800, savings: 0 },
        { month: 'May', income: 3500, expenses: 2200, savings: 0 },
      ];
      const summary = getSpendingTrendChartSummary(data, 'USD');

      expect(summary).toContain('Apr to May');
      expect(summary).toContain('$4,000');
      expect(summary).toContain('Latest month (May): $2,200');
    });
  });

  describe('getCategoryDonutChartSummary', () => {
    it('returns empty message when data is empty, undefined, or all zeroes', () => {
      expect(getCategoryDonutChartSummary([], 'USD')).toBe(
        'Category spending breakdown: No expenses recorded.'
      );
      expect(getCategoryDonutChartSummary(undefined, 'USD')).toBe(
        'Category spending breakdown: No expenses recorded.'
      );
      const zeroData: CategorySpending[] = [
        {
          categoryId: 'food',
          categoryName: 'Food & Dining',
          categoryIcon: 'coffee',
          categoryColor: '#FF6B6B',
          amount: 0,
          percentage: 0,
        },
      ];
      expect(getCategoryDonutChartSummary(zeroData, 'USD')).toBe(
        'Category spending breakdown: No expenses recorded.'
      );
    });

    it('summarizes categories ordered by amount and includes top categories', () => {
      const data: CategorySpending[] = [
        {
          categoryId: 'food',
          categoryName: 'Food & Dining',
          categoryIcon: 'coffee',
          categoryColor: '#FF6B6B',
          amount: 600,
          percentage: 60,
        },
        {
          categoryId: 'transport',
          categoryName: 'Transportation',
          categoryIcon: 'car',
          categoryColor: '#4ECDC4',
          amount: 400,
          percentage: 40,
        },
      ];
      const summary = getCategoryDonutChartSummary(data, 'USD');

      expect(summary).toContain('$1,000.00');
      expect(summary).toContain('2 categories');
      expect(summary).toContain('Food & Dining (60%, $600.00)');
      expect(summary).toContain('Transportation (40%, $400.00)');
    });
  });
});
