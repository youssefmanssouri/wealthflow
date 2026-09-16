import { MonthlyTrend, CategorySpending, Currency } from '../types/financial';
import { formatCurrency } from './currency';

/**
 * Generates an accessible, concise financial summary of the income vs expense chart.
 */
export function getIncomeExpenseChartSummary(
  data: MonthlyTrend[] | undefined,
  currency: Currency
): string {
  if (!data || data.length === 0) {
    return 'Income vs expense chart: No trend data available.';
  }

  const startMonth = data[0]?.month;
  const endMonth = data[data.length - 1]?.month;
  const period = data.length === 1 ? startMonth : `${startMonth} to ${endMonth}`;

  const totalIncome = data.reduce((sum, item) => sum + (item.income || 0), 0);
  const totalExpenses = data.reduce((sum, item) => sum + (item.expenses || 0), 0);
  const net = totalIncome - totalExpenses;

  return `Income vs expense chart for ${period}. Total income: ${formatCurrency(
    totalIncome,
    currency
  )}. Total expenses: ${formatCurrency(totalExpenses, currency)}. Net cashflow: ${formatCurrency(
    net,
    currency,
    { showSign: true }
  )}.`;
}

/**
 * Generates an accessible, concise financial summary of the spending trend chart.
 */
export function getSpendingTrendChartSummary(
  data: MonthlyTrend[] | undefined,
  currency: Currency
): string {
  if (!data || data.length === 0) {
    return 'Spending trend chart: No trend data available.';
  }

  const startMonth = data[0]?.month;
  const lastItem = data[data.length - 1];
  const endMonth = lastItem?.month;
  const period = data.length === 1 ? startMonth : `${startMonth} to ${endMonth}`;

  const totalExpenses = data.reduce((sum, item) => sum + (item.expenses || 0), 0);
  const latestExpense = lastItem?.expenses || 0;

  return `Spending trend chart for ${period}. Total spending: ${formatCurrency(
    totalExpenses,
    currency
  )}. Latest month (${endMonth}): ${formatCurrency(latestExpense, currency)}.`;
}

/**
 * Generates an accessible, concise financial summary of the category donut chart.
 */
export function getCategoryDonutChartSummary(
  data: CategorySpending[] | undefined,
  currency: Currency
): string {
  if (!data || data.length === 0) {
    return 'Category spending breakdown: No expenses recorded.';
  }

  const validCategories = data
    .filter((c) => c.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  if (validCategories.length === 0) {
    return 'Category spending breakdown: No expenses recorded.';
  }

  const totalAmount = validCategories.reduce((sum, c) => sum + c.amount, 0);
  const topList = validCategories
    .slice(0, 3)
    .map(
      (c) =>
        `${c.categoryName} (${c.percentage}%, ${formatCurrency(c.amount, currency)})`
    )
    .join(', ');

  const countStr =
    validCategories.length === 1 ? '1 category' : `${validCategories.length} categories`;

  return `Category spending breakdown. Total spending: ${formatCurrency(
    totalAmount,
    currency
  )} across ${countStr}. Top categories: ${topList}.`;
}
