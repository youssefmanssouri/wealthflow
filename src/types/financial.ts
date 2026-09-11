export type Currency = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CAD' | 'AUD';

export type TransactionType = 'income' | 'expense';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface Category {
  id: string;
  slug?: string;
  name: string;
  type: TransactionType;
  icon: string;
  color: string;
  isDefault?: boolean;
}

export interface Transaction {
  id: string;
  userId?: string;
  type: TransactionType;
  amount: number;
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  date: string; // ISO String (YYYY-MM-DD)
  merchant: string;
  description?: string;
  createdAt: string; // ISO Timestamp
  updatedAt?: string;
}

export interface Budget {
  id: string;
  userId?: string;
  categoryId: string;
  categoryName: string;
  limit: number;
  amount?: number; // DB field map
  spent: number; // dynamically computed or cached
  period: 'monthly' | 'yearly';
  createdAt?: string;
  updatedAt?: string;
}

export interface SavingsGoal {
  id: string;
  userId?: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string; // YYYY-MM-DD
  monthlyContribution: number;
  color: string;
  icon: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SavingsContribution {
  id: string;
  userId: string;
  goalId: string;
  amount: number;
  date: string;
  note?: string;
}

export interface FinancialInsight {
  id: string;
  title: string;
  message: string;
  type: 'warning' | 'positive' | 'info';
  impactPercentage?: number;
}

export interface UserPreferences {
  notifications: boolean;
  theme: ThemeMode;
  themeMode?: ThemeMode;
  currency: Currency;
}

export interface User {
  id: string;
  name: string;
  email: string;
  preferences: UserPreferences;
}

export interface CategorySpending {
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  categoryIcon: string;
  amount: number;
  percentage: number;
}

export interface MonthlyTrend {
  month: string; // e.g. 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'
  income: number;
  expenses: number;
  savings: number;
}
