import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useFinancial } from '../context/FinancialContext';
import { getGreeting, getCurrentMonthYear } from '../utils/date';
import { formatCurrency } from '../utils/currency';
import { SPACING, RADIUS } from '../constants/theme';
import { AppText } from '../components/ui/AppText';
import { Icon } from '../components/ui/Icon';
import { BalanceCard } from '../components/financial/BalanceCard';
import { TransactionRow } from '../components/financial/TransactionRow';
import { SavingsGoalCard } from '../components/financial/SavingsGoalCard';
import { ProgressBar } from '../components/ui/ProgressBar';
import { AppButton } from '../components/ui/AppButton';
import { EmptyState } from '../components/ui/EmptyState';
import { Transaction } from '../types/financial';

export const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const {
    user,
    transactions,
    monthlyBudgetTotal,
    monthlyBudgetSpent,
    savingsGoals,
    isRefreshing,
    refreshFinancialData,
  } = useFinancial();

  const greeting = getGreeting();
  const currentMonth = getCurrentMonthYear();
  const currency = user.preferences.currency;

  const recentTransactions = transactions.slice(0, 5);

  const budgetProgress =
    monthlyBudgetTotal > 0 ? monthlyBudgetSpent / monthlyBudgetTotal : 0;
  const budgetPercentage = Math.round(budgetProgress * 100);
  const budgetRemaining = monthlyBudgetTotal - monthlyBudgetSpent;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refreshFinancialData}
            tintColor={colors.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <AppText variant="xs" color="secondary" weight="medium">
              {currentMonth}
            </AppText>
            <AppText variant="xl" weight="bold">
              {greeting}, {user.name}
            </AppText>
          </View>
          <TouchableOpacity
            activeOpacity={0.7}
            style={[styles.bellButton, { backgroundColor: colors.inputBg }]}
          >
            <Icon name="bell" size={20} color={colors.textPrimary} />
            <View style={[styles.notificationDot, { backgroundColor: colors.primary }]} />
          </TouchableOpacity>
        </View>

        {/* Primary Balance Focal Card */}
        <BalanceCard onAddTransaction={() => navigation.navigate('AddTransaction')} />

        {/* Monthly Spending Budget Summary */}
        <View
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={styles.sectionHeader}>
            <View style={styles.titleWithIcon}>
              <View style={[styles.miniIconBg, { backgroundColor: colors.primaryLight }]}>
                <Icon name="pie-chart" size={16} color={colors.primary} />
              </View>
              <AppText variant="md" weight="bold">
                Monthly Spending Budget
              </AppText>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('BudgetTab')}>
              <AppText variant="xs" weight="bold" color="brand">
                View All
              </AppText>
            </TouchableOpacity>
          </View>

          <View style={styles.budgetRow}>
            <View>
              <AppText variant="xs" color="secondary">
                Spent / Budget Limit
              </AppText>
              <AppText variant="md" weight="bold">
                {formatCurrency(monthlyBudgetSpent, currency)}{' '}
                <AppText variant="xs" color="muted">
                  / {formatCurrency(monthlyBudgetTotal, currency)}
                </AppText>
              </AppText>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <AppText variant="xs" color="secondary">
                Remaining
              </AppText>
              <AppText
                variant="sm"
                weight="bold"
                color={budgetRemaining < 0 ? 'negative' : 'positive'}
              >
                {formatCurrency(Math.max(0, budgetRemaining), currency)}
              </AppText>
            </View>
          </View>

          <ProgressBar progress={budgetProgress} height={8} style={{ marginTop: SPACING.sm }} />

          <AppText variant="xs" color="secondary" style={{ marginTop: SPACING.xs }}>
            {budgetPercentage}% of overall monthly budget used
          </AppText>
        </View>

        {/* Savings Snapshot Section */}
        {savingsGoals.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <AppText variant="lg" weight="bold">
                Savings Progress
              </AppText>
              <TouchableOpacity onPress={() => navigation.navigate('SavingsGoals')}>
                <AppText variant="xs" weight="bold" color="brand">
                  See All ({savingsGoals.length})
                </AppText>
              </TouchableOpacity>
            </View>

            {savingsGoals.slice(0, 2).map((goal) => (
              <SavingsGoalCard
                key={goal.id}
                goal={goal}
                onContribute={() =>
                  navigation.navigate('ContributeSavings', { goalId: goal.id })
                }
                onEdit={() =>
                  navigation.navigate('EditSavingsGoal', { goalId: goal.id })
                }
              />
            ))}

            {savingsGoals.length > 2 && (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => navigation.navigate('SavingsGoals')}
                style={[
                  styles.viewAllSavingsBtn,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <AppText variant="xs" weight="semibold" color="brand">
                  View all {savingsGoals.length} savings goals →
                </AppText>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Recent Transactions Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <AppText variant="lg" weight="bold">
              Recent Transactions
            </AppText>
            <TouchableOpacity onPress={() => navigation.navigate('TransactionsTab')}>
              <AppText variant="xs" weight="bold" color="brand">
                See All
              </AppText>
            </TouchableOpacity>
          </View>

          {recentTransactions.length > 0 ? (
            recentTransactions.map((tx) => (
              <TransactionRow
                key={tx.id}
                transaction={tx}
                onPress={() => navigation.navigate('TransactionDetail', { transactionId: tx.id })}
              />
            ))
          ) : (
            <EmptyState
              icon="receipt"
              title="No Recent Transactions"
              description="Tap below to record your first income or expense transaction."
              actionLabel="Add Transaction"
              onAction={() => navigation.navigate('AddTransaction')}
            />
          )}
        </View>

        {/* Quick Action Add Transaction Button */}
        <View style={{ marginTop: SPACING.md, marginBottom: SPACING.xl }}>
          <AppButton
            title="Add Transaction"
            onPress={() => navigation.navigate('AddTransaction')}
            variant="primary"
            size="lg"
            icon="plus"
            fullWidth
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
    marginTop: SPACING.xs,
  },
  bellButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationDot: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  card: {
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm + 2,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  miniIconBg: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  budgetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  viewAllSavingsBtn: {
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.xs,
  },
});
