import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';
import {
  User,
  Transaction,
  Budget,
  SavingsGoal,
  Currency,
  CategorySpending,
  FinancialInsight,
  MonthlyTrend,
  Category,
} from '../types/financial';
import {
  INITIAL_USER,
  INITIAL_TRANSACTIONS,
  INITIAL_BUDGETS,
  INITIAL_SAVINGS_GOALS,
} from '../data/mockData';
import {
  calculateTotalBalance,
  calculateMonthlyIncome,
  calculateMonthlyExpenses,
  calculateCategorySpending,
  generateFinancialInsights,
  calculateMonthlyTrends,
} from '../utils/financial';
import { EXPENSE_CATEGORIES, getCategoryById, resolveCanonicalCategoryId } from '../constants/categories';
import { transactionsService } from '../services/transactionsService';
import { budgetService } from '../services/budgetService';
import { savingsService } from '../services/savingsService';
import { categoriesService } from '../services/categoriesService';
import { profileService } from '../services/profileService';
import { migrationService } from '../services/migrationService';
import { MigrationModal } from '../components/financial/MigrationModal';

const USER_STORAGE_KEY = '@wealthflow_user_data';
const TRANSACTIONS_STORAGE_KEY = '@wealthflow_transactions_data';
const BUDGETS_STORAGE_KEY = '@wealthflow_budgets_data';
const SAVINGS_STORAGE_KEY = '@wealthflow_savings_data';

interface FinancialContextType {
  user: User;
  transactions: Transaction[];
  budgets: Budget[];
  savingsGoals: SavingsGoal[];
  categories: Category[];
  isLoaded: boolean;
  isRefreshing: boolean;

  // Computed Properties (Single Source of Truth)
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyBudgetTotal: number;
  monthlyBudgetSpent: number;
  categorySpending: CategorySpending[];
  financialInsights: FinancialInsight[];
  monthlyTrends: MonthlyTrend[];

  // Mutator Actions
  refreshFinancialData: () => Promise<void>;
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => Promise<{ success: boolean; error?: string }>;
  editTransaction: (id: string, updated: Partial<Transaction>) => Promise<{ success: boolean; error?: string }>;
  deleteTransaction: (id: string) => Promise<{ success: boolean; error?: string }>;
  saveBudget: (categoryId: string, categoryName: string, limit: number) => Promise<{ success: boolean; error?: string }>;
  deleteBudget: (categoryId: string) => Promise<{ success: boolean; error?: string }>;
  updateSavingsProgress: (goalId: string, addedAmount: number, note?: string) => Promise<{ success: boolean; error?: string }>;
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id' | 'currentAmount'>) => Promise<{ success: boolean; error?: string }>;
  updateSavingsGoal: (goalId: string, updates: { name: string; targetAmount: number; targetDate: string }) => Promise<{ success: boolean; error?: string }>;
  deleteSavingsGoal: (goalId: string) => Promise<{ success: boolean; error?: string }>;
  setCurrency: (currency: Currency) => Promise<void>;
  resetToDefaultData: () => Promise<void>;
  clearAllUserData: () => Promise<void>;
}

const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

export const FinancialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, isAuthenticated } = useAuth();

  const [user, setUser] = useState<User>(INITIAL_USER);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [budgets, setBudgets] = useState<Budget[]>(INITIAL_BUDGETS);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(INITIAL_SAVINGS_GOALS);
  const [categories, setCategories] = useState<Category[]>(EXPENSE_CATEGORIES);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Migration Prompt State
  const [showMigrationModal, setShowMigrationModal] = useState(false);

  // 1. Fetch Cloud Data for Authenticated Users
  const fetchCloudData = useCallback(async (userId: string) => {
    try {
      const [txs, bdgts, goals, cats] = await Promise.all([
        transactionsService.fetchTransactions(userId),
        budgetService.fetchBudgets(userId),
        savingsService.fetchSavingsGoals(userId),
        categoriesService.fetchCategories(),
      ]);

      setTransactions(txs);
      setBudgets(
        bdgts.map((b) => {
          const limitVal = b.amount ?? b.limit ?? 0;
          const cat = cats.find((c) => c.id === b.categoryId) || getCategoryById(b.categoryId);
          return {
            ...b,
            limit: limitVal,
            spent: 0,
            categoryName: cat.name,
          };
        })
      );
      setSavingsGoals(goals);
      setCategories(cats);
    } catch (err) {
      console.warn('Error fetching cloud financial data:', err);
    }
  }, []);

  // 2. Initial Data Loading & Migration Check
  useEffect(() => {
    const initData = async () => {
      setIsLoaded(false);
      if (isAuthenticated && currentUser) {
        // Sync user profile settings into User object
        setUser({
          id: currentUser.id,
          name: currentUser.fullName,
          email: currentUser.email,
          preferences: {
            currency: currentUser.currency,
            theme: currentUser.themeMode,
            themeMode: currentUser.themeMode,
            notifications: true,
          },
        });

        await fetchCloudData(currentUser.id);

        // Check if unmigrated local Phase 1 data exists
        const hasLocal = await migrationService.checkHasLocalData(currentUser.id);
        if (hasLocal) {
          setShowMigrationModal(true);
        }
      } else {
        // Unauthenticated local fallback
        try {
          const storedUser = await AsyncStorage.getItem(USER_STORAGE_KEY);
          const storedTxs = await AsyncStorage.getItem(TRANSACTIONS_STORAGE_KEY);
          const storedBudgets = await AsyncStorage.getItem(BUDGETS_STORAGE_KEY);
          const storedSavings = await AsyncStorage.getItem(SAVINGS_STORAGE_KEY);

          if (storedUser) setUser(JSON.parse(storedUser));
          if (storedTxs) setTransactions(JSON.parse(storedTxs));
          if (storedBudgets) setBudgets(JSON.parse(storedBudgets));
          if (storedSavings) setSavingsGoals(JSON.parse(storedSavings));
        } catch (err) {
          console.warn('AsyncStorage load warning:', err);
        }
      }
      setIsLoaded(true);
    };

    initData();
  }, [isAuthenticated, currentUser, fetchCloudData]);

  // Refresh Trigger for Manual Pull-to-Refresh
  const refreshFinancialData = async () => {
    if (!isAuthenticated || !currentUser) return;
    setIsRefreshing(true);
    await fetchCloudData(currentUser.id);
    setIsRefreshing(false);
  };

  // Migration Handlers
  const handleImportMigration = async () => {
    if (!currentUser) return;
    const res = await migrationService.migrateLocalDataToCloud(currentUser.id);
    setShowMigrationModal(false);
    if (res.success) {
      await fetchCloudData(currentUser.id);
    }
  };

  const handleStartFreshMigration = async () => {
    if (!currentUser) return;
    await migrationService.setStartFreshDecision(currentUser.id);
    setShowMigrationModal(false);
  };

  // 3. Computed Deterministic Financial States
  const currentMonthStr = useMemo(() => new Date().toISOString().substring(0, 7), []);

  const totalSavings = useMemo(() => {
    return savingsGoals.reduce((sum, g) => sum + g.currentAmount, 0);
  }, [savingsGoals]);

  const totalBalance = useMemo(() => {
    return calculateTotalBalance(transactions, totalSavings);
  }, [transactions, totalSavings]);

  const monthlyIncome = useMemo(() => {
    return calculateMonthlyIncome(transactions, currentMonthStr);
  }, [transactions, currentMonthStr]);

  const monthlyExpenses = useMemo(() => {
    return calculateMonthlyExpenses(transactions, currentMonthStr);
  }, [transactions, currentMonthStr]);

  const dynamicBudgets = useMemo(() => {
    const monthExpenses = transactions.filter(
      (t) => t.type === 'expense' && t.date.startsWith(currentMonthStr)
    );

    return budgets.map((bgt) => {
      const canonicalBgtCatId = resolveCanonicalCategoryId(bgt.categoryId);
      const spentForCategory = monthExpenses
        .filter((t) => resolveCanonicalCategoryId(t.categoryId) === canonicalBgtCatId)
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        ...bgt,
        categoryId: canonicalBgtCatId,
        limit: bgt.amount || bgt.limit || 0,
        spent: spentForCategory,
      };
    });
  }, [budgets, transactions, currentMonthStr]);

  const monthlyBudgetTotal = useMemo(() => {
    return dynamicBudgets.reduce((sum, b) => sum + (b.limit || b.amount || 0), 0);
  }, [dynamicBudgets]);

  const monthlyBudgetSpent = useMemo(() => {
    return dynamicBudgets.reduce((sum, b) => sum + b.spent, 0);
  }, [dynamicBudgets]);

  const categorySpending = useMemo(() => {
    return calculateCategorySpending(transactions, categories.length > 0 ? categories : EXPENSE_CATEGORIES, currentMonthStr);
  }, [transactions, categories, currentMonthStr]);

  const monthlyTrends = useMemo(() => {
    return calculateMonthlyTrends(transactions);
  }, [transactions]);

  const financialInsights = useMemo(() => {
    return generateFinancialInsights(transactions, dynamicBudgets, savingsGoals);
  }, [transactions, dynamicBudgets, savingsGoals]);

  // 4. Mutator Actions (Cloud Source of Truth when authenticated)
  const addTransaction = async (txData: Omit<Transaction, 'id' | 'createdAt'>) => {
    const canonicalCategoryId = resolveCanonicalCategoryId(txData.categoryId);
    const cat = getCategoryById(canonicalCategoryId);
    const normalizedTx = {
      ...txData,
      categoryId: canonicalCategoryId,
      categoryName: txData.categoryName || cat.name,
      categoryIcon: txData.categoryIcon || cat.icon,
      categoryColor: txData.categoryColor || cat.color,
    };

    if (isAuthenticated && currentUser) {
      const res = await transactionsService.createTransaction(currentUser.id, normalizedTx);
      if (res.success && res.transaction) {
        setTransactions((prev) => [res.transaction!, ...prev]);
        return { success: true };
      }
      return { success: false, error: res.error };
    } else {
      const newTx: Transaction = {
        ...normalizedTx,
        id: `tx_${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      const updated = [newTx, ...transactions];
      setTransactions(updated);
      await AsyncStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(updated));
      return { success: true };
    }
  };

  const editTransaction = async (id: string, updatedFields: Partial<Transaction>) => {
    const existing = transactions.find((t) => t.id === id);
    if (!existing) return { success: false, error: 'Transaction not found' };

    const canonicalCategoryId = updatedFields.categoryId
      ? resolveCanonicalCategoryId(updatedFields.categoryId)
      : existing.categoryId;
    const cat = getCategoryById(canonicalCategoryId);

    const merged: Transaction = {
      ...existing,
      ...updatedFields,
      categoryId: canonicalCategoryId,
      categoryName: updatedFields.categoryName || cat.name,
      categoryIcon: updatedFields.categoryIcon || cat.icon,
      categoryColor: updatedFields.categoryColor || cat.color,
    };

    if (isAuthenticated && currentUser) {
      const res = await transactionsService.updateTransaction(currentUser.id, merged);
      if (res.success && res.transaction) {
        setTransactions((prev) => prev.map((t) => (t.id === id ? res.transaction! : t)));
        return { success: true };
      }
      return { success: false, error: res.error };
    } else {
      const updated = transactions.map((t) => (t.id === id ? merged : t));
      setTransactions(updated);
      await AsyncStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(updated));
      return { success: true };
    }
  };

  const deleteTransaction = async (id: string) => {
    if (isAuthenticated && currentUser) {
      const res = await transactionsService.deleteTransaction(currentUser.id, id);
      if (res.success) {
        setTransactions((prev) => prev.filter((t) => t.id !== id));
        return { success: true };
      }
      return { success: false, error: res.error };
    } else {
      const updated = transactions.filter((t) => t.id !== id);
      setTransactions(updated);
      await AsyncStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(updated));
      return { success: true };
    }
  };

  const saveBudget = async (categoryId: string, categoryName: string, limit: number) => {
    const canonicalCategoryId = resolveCanonicalCategoryId(categoryId);
    const cat = getCategoryById(canonicalCategoryId);
    const resolvedName = categoryName || cat.name;

    if (isAuthenticated && currentUser) {
      const res = await budgetService.upsertBudget(currentUser.id, {
        categoryId: canonicalCategoryId,
        amount: limit,
        period: 'monthly',
      });
      if (res.success && res.budget) {
        setBudgets((prev) => {
          const idx = prev.findIndex((b) => resolveCanonicalCategoryId(b.categoryId) === canonicalCategoryId);
          if (idx >= 0) {
            return prev.map((b) =>
              resolveCanonicalCategoryId(b.categoryId) === canonicalCategoryId
                ? { ...b, categoryId: canonicalCategoryId, amount: limit, limit }
                : b
            );
          }
          return [...prev, { ...res.budget!, categoryId: canonicalCategoryId, limit, categoryName: resolvedName, spent: 0 }];
        });
        return { success: true };
      }
      return { success: false, error: res.error };
    } else {
      const existingIndex = budgets.findIndex(
        (b) => resolveCanonicalCategoryId(b.categoryId) === canonicalCategoryId
      );
      let updated: Budget[];
      if (existingIndex >= 0) {
        updated = budgets.map((b) =>
          resolveCanonicalCategoryId(b.categoryId) === canonicalCategoryId
            ? { ...b, categoryId: canonicalCategoryId, limit, amount: limit }
            : b
        );
      } else {
        const newBudget: Budget = {
          id: `bgt_${canonicalCategoryId}`,
          categoryId: canonicalCategoryId,
          categoryName: resolvedName,
          limit,
          amount: limit,
          spent: 0,
          period: 'monthly',
        };
        updated = [...budgets, newBudget];
      }
      setBudgets(updated);
      await AsyncStorage.setItem(BUDGETS_STORAGE_KEY, JSON.stringify(updated));
      return { success: true };
    }
  };

  const deleteBudget = async (categoryId: string) => {
    const canonicalCategoryId = resolveCanonicalCategoryId(categoryId);
    if (isAuthenticated && currentUser) {
      const res = await budgetService.deleteBudget(currentUser.id, canonicalCategoryId);
      if (res.success) {
        setBudgets((prev) =>
          prev.filter((b) => resolveCanonicalCategoryId(b.categoryId) !== canonicalCategoryId)
        );
        return { success: true };
      }
      return { success: false, error: res.error };
    } else {
      const updated = budgets.filter(
        (b) => resolveCanonicalCategoryId(b.categoryId) !== canonicalCategoryId
      );
      setBudgets(updated);
      await AsyncStorage.setItem(BUDGETS_STORAGE_KEY, JSON.stringify(updated));
      return { success: true };
    }
  };

  const updateSavingsProgress = async (goalId: string, addedAmount: number, note?: string) => {
    if (isAuthenticated && currentUser) {
      const res = await savingsService.addContribution(currentUser.id, goalId, addedAmount, note);
      if (res.success) {
        setSavingsGoals((prev) =>
          prev.map((g) => (g.id === goalId ? { ...g, currentAmount: g.currentAmount + addedAmount } : g))
        );
        return { success: true };
      }
      return { success: false, error: res.error };
    } else {
      const updated = savingsGoals.map((g) => {
        if (g.id === goalId) {
          return { ...g, currentAmount: Math.max(0, g.currentAmount + addedAmount) };
        }
        return g;
      });
      setSavingsGoals(updated);
      await AsyncStorage.setItem(SAVINGS_STORAGE_KEY, JSON.stringify(updated));
      return { success: true };
    }
  };

  const addSavingsGoal = async (goalData: Omit<SavingsGoal, 'id' | 'currentAmount'>) => {
    if (isAuthenticated && currentUser) {
      const res = await savingsService.createSavingsGoal(currentUser.id, goalData);
      if (res.success && res.goal) {
        setSavingsGoals((prev) => [...prev, res.goal!]);
        return { success: true };
      }
      return { success: false, error: res.error };
    } else {
      const newGoal: SavingsGoal = {
        ...goalData,
        id: `svg_${Date.now()}`,
        currentAmount: 0,
      };
      const updated = [...savingsGoals, newGoal];
      setSavingsGoals(updated);
      await AsyncStorage.setItem(SAVINGS_STORAGE_KEY, JSON.stringify(updated));
      return { success: true };
    }
  };

  const updateSavingsGoal = async (
    goalId: string,
    updates: { name: string; targetAmount: number; targetDate: string }
  ) => {
    if (isAuthenticated && currentUser) {
      const res = await savingsService.updateSavingsGoal(currentUser.id, goalId, updates);
      if (res.success && res.goal) {
        setSavingsGoals((prev) =>
          prev.map((g) => (g.id === goalId ? { ...g, ...res.goal! } : g))
        );
        return { success: true };
      }
      return { success: false, error: res.error };
    } else {
      const updated = savingsGoals.map((g) =>
        g.id === goalId
          ? {
              ...g,
              name: updates.name,
              targetAmount: updates.targetAmount,
              targetDate: updates.targetDate,
              monthlyContribution: Math.round(updates.targetAmount / 12),
            }
          : g
      );
      setSavingsGoals(updated);
      await AsyncStorage.setItem(SAVINGS_STORAGE_KEY, JSON.stringify(updated));
      return { success: true };
    }
  };

  const deleteSavingsGoal = async (goalId: string) => {
    if (isAuthenticated && currentUser) {
      const res = await savingsService.deleteSavingsGoal(currentUser.id, goalId);
      if (res.success) {
        setSavingsGoals((prev) => prev.filter((g) => g.id !== goalId));
        return { success: true };
      }
      return { success: false, error: res.error };
    } else {
      const updated = savingsGoals.filter((g) => g.id !== goalId);
      setSavingsGoals(updated);
      await AsyncStorage.setItem(SAVINGS_STORAGE_KEY, JSON.stringify(updated));
      return { success: true };
    }
  };

  const setCurrency = async (newCurrency: Currency) => {
    const updatedUser: User = {
      ...user,
      preferences: { ...user.preferences, currency: newCurrency },
    };
    setUser(updatedUser);

    if (isAuthenticated && currentUser) {
      await profileService.updateProfile(currentUser.id, { currency: newCurrency });
    } else {
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
    }
  };

  const resetToDefaultData = async () => {
    if (!isAuthenticated) {
      setTransactions(INITIAL_TRANSACTIONS);
      setBudgets(INITIAL_BUDGETS);
      setSavingsGoals(INITIAL_SAVINGS_GOALS);
      setUser(INITIAL_USER);
      await AsyncStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(INITIAL_TRANSACTIONS));
      await AsyncStorage.setItem(BUDGETS_STORAGE_KEY, JSON.stringify(INITIAL_BUDGETS));
      await AsyncStorage.setItem(SAVINGS_STORAGE_KEY, JSON.stringify(INITIAL_SAVINGS_GOALS));
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(INITIAL_USER));
    }
  };

  const clearAllUserData = async () => {
    setTransactions([]);
    setBudgets([]);
    setSavingsGoals([]);
    setUser(INITIAL_USER);
    await AsyncStorage.multiRemove([
      USER_STORAGE_KEY,
      TRANSACTIONS_STORAGE_KEY,
      BUDGETS_STORAGE_KEY,
      SAVINGS_STORAGE_KEY,
      '@wealthflow_user',
      '@wealthflow_transactions_v1',
      '@wealthflow_budgets_v1',
      '@wealthflow_savings_v1',
      '@wealthflow_transactions',
      '@wealthflow_budgets',
      '@wealthflow_savings_goals',
      '@wealthflow_savings_contributions',
      '@wealthflow_transactions_data',
      '@wealthflow_budgets_data',
      '@wealthflow_savings_data',
    ]);
  };

  return (
    <FinancialContext.Provider
      value={{
        user,
        transactions,
        budgets: dynamicBudgets,
        savingsGoals,
        categories,
        isLoaded,
        isRefreshing,
        totalBalance,
        monthlyIncome,
        monthlyExpenses,
        monthlyBudgetTotal,
        monthlyBudgetSpent,
        categorySpending,
        financialInsights,
        monthlyTrends,
        refreshFinancialData,
        addTransaction,
        editTransaction,
        deleteTransaction,
        saveBudget,
        deleteBudget,
        updateSavingsProgress,
        addSavingsGoal,
        updateSavingsGoal,
        deleteSavingsGoal,
        setCurrency,
        resetToDefaultData,
        clearAllUserData,
      }}
    >
      {children}

      <MigrationModal
        visible={showMigrationModal}
        onImport={handleImportMigration}
        onStartFresh={handleStartFreshMigration}
      />
    </FinancialContext.Provider>
  );
};

export const useFinancial = (): FinancialContextType => {
  const context = useContext(FinancialContext);
  if (!context) {
    throw new Error('useFinancial must be used within a FinancialProvider');
  }
  return context;
};
