import {
  Transaction,
  Budget,
  SavingsGoal,
  CategorySpending,
  FinancialInsight,
  MonthlyTrend,
  Category,
} from '../types/financial';
import { EXPENSE_CATEGORIES, resolveCanonicalCategoryId } from '../constants/categories';

export const calculateTotalBalance = (transactions: Transaction[], baseSavings: number = 0): number => {
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  return totalIncome - totalExpenses + baseSavings;
};

export const calculateMonthlyIncome = (transactions: Transaction[], targetYearMonth?: string): number => {
  const target = targetYearMonth || new Date().toISOString().substring(0, 7); // YYYY-MM
  return transactions
    .filter((t) => t.type === 'income' && t.date.startsWith(target))
    .reduce((sum, t) => sum + t.amount, 0);
};

export const calculateMonthlyExpenses = (transactions: Transaction[], targetYearMonth?: string): number => {
  const target = targetYearMonth || new Date().toISOString().substring(0, 7); // YYYY-MM
  return transactions
    .filter((t) => t.type === 'expense' && t.date.startsWith(target))
    .reduce((sum, t) => sum + t.amount, 0);
};

export const calculateCategorySpending = (
  transactions: Transaction[],
  categories: Category[] = EXPENSE_CATEGORIES,
  targetYearMonth?: string
): CategorySpending[] => {
  const target = targetYearMonth || new Date().toISOString().substring(0, 7);
  const monthExpenses = transactions.filter(
    (t) => t.type === 'expense' && t.date.startsWith(target)
  );

  const totalExpenseAmount = monthExpenses.reduce((sum, t) => sum + t.amount, 0);

  const spendingMap: Record<string, number> = {};

  monthExpenses.forEach((t) => {
    const canonicalId = resolveCanonicalCategoryId(t.categoryId);
    spendingMap[canonicalId] = (spendingMap[canonicalId] || 0) + t.amount;
  });

  const result: CategorySpending[] = categories.map((cat) => {
    const amount = spendingMap[cat.id] || 0;
    const percentage = totalExpenseAmount > 0 ? Math.round((amount / totalExpenseAmount) * 100) : 0;

    return {
      categoryId: cat.id,
      categoryName: cat.name,
      categoryColor: cat.color,
      categoryIcon: cat.icon,
      amount,
      percentage,
    };
  });

  return result.filter((item) => item.amount > 0).sort((a, b) => b.amount - a.amount);
};

export const getBudgetStatus = (spent: number, limit: number): 'healthy' | 'warning' | 'over_budget' => {
  if (limit <= 0) return 'healthy';
  const ratio = spent / limit;
  if (ratio >= 1.0) return 'over_budget';
  if (ratio >= 0.8) return 'warning';
  return 'healthy';
};

export const calculateMonthlyTrends = (transactions: Transaction[]): MonthlyTrend[] => {
  const monthsMap: Record<string, { income: number; expenses: number }> = {};
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Default last 6 months setup
  const now = new Date();
  const recentMonths: string[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toISOString().substring(0, 7);
    recentMonths.push(key);
    monthsMap[key] = { income: 0, expenses: 0 };
  }

  transactions.forEach((t) => {
    const key = t.date.substring(0, 7);
    if (monthsMap[key]) {
      if (t.type === 'income') {
        monthsMap[key].income += t.amount;
      } else {
        monthsMap[key].expenses += t.amount;
      }
    }
  });

  return recentMonths.map((key) => {
    const [year, month] = key.split('-');
    const mIndex = parseInt(month, 10) - 1;
    const data = monthsMap[key] || { income: 0, expenses: 0 };
    return {
      month: monthNames[mIndex],
      income: data.income,
      expenses: data.expenses,
      savings: Math.max(0, data.income - data.expenses),
    };
  });
};

export const generateFinancialInsights = (
  transactions: Transaction[],
  budgets: Budget[],
  savingsGoals: SavingsGoal[]
): FinancialInsight[] => {
  const insights: FinancialInsight[] = [];
  const currentTarget = new Date().toISOString().substring(0, 7);
  const monthlyIncome = calculateMonthlyIncome(transactions, currentTarget);
  const monthlyExpenses = calculateMonthlyExpenses(transactions, currentTarget);

  // 1. Savings Rate Insight
  if (monthlyIncome > 0) {
    const savingsRate = Math.round(((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100);
    if (savingsRate >= 20) {
      insights.push({
        id: 'ins_savings_rate_good',
        title: 'Strong Savings Rate',
        message: `You are saving ${savingsRate}% of your income this month. Excellent progress toward financial freedom!`,
        type: 'positive',
        impactPercentage: savingsRate,
      });
    } else if (savingsRate > 0) {
      insights.push({
        id: 'ins_savings_rate_warn',
        title: 'Modest Savings Rate',
        message: `Your savings rate is currently ${savingsRate}%. Aiming for 20% can accelerate your goal completion.`,
        type: 'info',
        impactPercentage: savingsRate,
      });
    } else {
      insights.push({
        id: 'ins_savings_rate_negative',
        title: 'Expenses Exceed Income',
        message: 'Your monthly expenses currently exceed your income. Review your top spending categories to rebalance.',
        type: 'warning',
      });
    }
  }

  // 2. Highest Spending Category Insight
  const categorySpending = calculateCategorySpending(transactions, EXPENSE_CATEGORIES, currentTarget);
  if (categorySpending.length > 0) {
    const topCategory = categorySpending[0];
    insights.push({
      id: 'ins_top_spending',
      title: `Top Expense: ${topCategory.categoryName}`,
      message: `${topCategory.categoryName} represents ${topCategory.percentage}% of your monthly expenses.`,
      type: topCategory.percentage > 35 ? 'warning' : 'info',
      impactPercentage: topCategory.percentage,
    });
  }

  // 3. Over Budget Warning Insight
  const overBudgets = budgets.filter((b) => b.limit > 0 && b.spent > b.limit);
  if (overBudgets.length > 0) {
    insights.push({
      id: 'ins_over_budget',
      title: 'Over Budget Alert',
      message: `You have exceeded your limit in ${overBudgets.length} budget category. Check the Budget tab for details.`,
      type: 'warning',
    });
  }

  // 4. Savings Goal Milestone
  if (savingsGoals.length > 0) {
    const primaryGoal = savingsGoals[0];
    const progressPct = Math.round((primaryGoal.currentAmount / primaryGoal.targetAmount) * 100);
    insights.push({
      id: 'ins_savings_goal',
      title: `Goal Progress: ${primaryGoal.name}`,
      message: `You've reached ${progressPct}% of your ${primaryGoal.name} target date. Keep it up!`,
      type: 'positive',
      impactPercentage: progressPct,
    });
  }

  return insights;
};
