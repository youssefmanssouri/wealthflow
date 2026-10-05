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
import { ContributionHistoryModal } from '../components/financial/ContributionHistoryModal';
import { ProgressBar } from '../components/ui/ProgressBar';
import { AppButton } from '../components/ui/AppButton';
import { EmptyState } from '../components/ui/EmptyState';
import { SavingsGoal } from '../types/financial';

export const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const {
    user,
    transactions,
    monthlyBudgetTotal,
    monthlyBudgetSpent,
    savingsGoals,
    isRefreshing,
    loadError,
    refreshFinancialData,
  } = useFinancial();

  const [historyGoal, setHistoryGoal] = useState<SavingsGoal | null>(null);

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
        {/* Header / Date & Greeting */}
        <View style={styles.header}>
          <AppText variant="xs" color="secondary" weight="medium" style={styles.dateKicker}>
            {currentMonth}
          </AppText>
          <AppText variant="xl" weight="bold" numberOfLines={1} ellipsizeMode="tail">
            {greeting}, {user.name || 'there'}
          </AppText>
        </View>

        {/* Retryable Load Error Banner */}
        {loadError && (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={refreshFinancialData}
            style={[
              styles.errorBanner,
              { backgroundColor: colors.negativeBg, borderColor: colors.negative + '30' },
            ]}
          >
            <Icon name="AlertCircle" size={16} color={colors.negative} />
            <AppText
              variant="xs"
              weight="medium"
              style={{ flex: 1, color: colors.negative, marginLeft: 8 }}
            >
              {loadError} Tap to retry.
            </AppText>
            <Icon name="RefreshCw" size={13} color={colors.negative} />
          </TouchableOpacity>
        )}

        {/* Primary Balance Section */}
        <BalanceCard onAddTransaction={() => navigation.navigate('AddTransaction')} />

        {/* Monthly Spending Budget Summary */}
        <View
          style={[
            styles.budgetCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={styles.sectionHeader}>
            <View style={styles.titleWithIcon}>
              <Icon name="pie-chart" size={15} color={colors.textSecondary} />
              <AppText variant="sm" weight="semibold">
                Monthly Spending Budget
              </AppText>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate('BudgetTab')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <AppText variant="xs" weight="medium" color="brand">
                {monthlyBudgetTotal > 0 ? 'View All' : 'Set Budget'}
              </AppText>
            </TouchableOpacity>
          </View>

          {monthlyBudgetTotal > 0 ? (
            <>
              <View style={styles.budgetRow}>
                <View>
                  <AppText variant="xs" color="secondary">
                    Spent / Limit
                  </AppText>
                  <AppText variant="sm" weight="semibold" style={{ marginTop: 2 }}>
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
                    weight="semibold"
                    color={budgetRemaining < 0 ? 'negative' : 'positive'}
                    style={{ marginTop: 2 }}
                  >
                    {formatCurrency(Math.max(0, budgetRemaining), currency)}
                  </AppText>
                </View>
              </View>

              <ProgressBar
                progress={budgetProgress}
                height={6}
                style={{ marginTop: SPACING.sm }}
              />

              <AppText variant="xs" color="muted" style={{ marginTop: SPACING.xs }}>
                {budgetPercentage}% of overall monthly budget used
              </AppText>
            </>
          ) : (
            <View style={styles.emptyBudgetContainer}>
              <AppText variant="xs" color="secondary" style={styles.emptyBudgetText}>
                Set category spending limits to monitor monthly expenses.
              </AppText>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => navigation.navigate('BudgetTab')}
                style={[
                  styles.createBudgetBtn,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
              >
                <Icon name="plus" size={13} color={colors.primary} />
                <AppText variant="xs" weight="medium" color="brand">
                  Create Budget Limit
                </AppText>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Savings Snapshot Section */}
        {savingsGoals.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <AppText variant="sm" weight="semibold">
                Savings Progress
              </AppText>
              <TouchableOpacity
                onPress={() => navigation.navigate('SavingsGoals')}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <AppText variant="xs" weight="medium" color="brand">
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
                onViewHistory={() => setHistoryGoal(goal)}
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
                <AppText variant="xs" weight="medium" color="secondary">
                  View all {savingsGoals.length} savings goals →
                </AppText>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Recent Transactions Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <AppText variant="sm" weight="semibold">
              Recent Transactions
            </AppText>
            <TouchableOpacity
              onPress={() => navigation.navigate('TransactionsTab')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <AppText variant="xs" weight="medium" color="brand">
                See All
              </AppText>
            </TouchableOpacity>
          </View>

          {recentTransactions.length > 0 ? (
            <View
              style={[
                styles.transactionListContainer,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              {recentTransactions.map((tx, index) => (
                <TransactionRow
                  key={tx.id}
                  transaction={tx}
                  variant="flat"
                  hideBorder={index === recentTransactions.length - 1}
                  onPress={() => navigation.navigate('TransactionDetail', { transactionId: tx.id })}
                />
              ))}
            </View>
          ) : (
            <EmptyState
              icon="receipt"
              title="No Recent Transactions"
              description="Record your first income or expense transaction to start tracking your cash flow."
              actionLabel="Add Transaction"
              onAction={() => navigation.navigate('AddTransaction')}
            />
          )}
        </View>

        {/* Quick Action Add Transaction Button */}
        {recentTransactions.length > 0 && (
          <View style={styles.bottomActionContainer}>
            <AppButton
              title="Add Transaction"
              onPress={() => navigation.navigate('AddTransaction')}
              variant="outline"
              size="md"
              icon="plus"
              fullWidth
            />
          </View>
        )}
      </ScrollView>

      {/* Lightweight Read-Only Contribution History Modal */}
      <ContributionHistoryModal
        visible={!!historyGoal}
        goal={historyGoal}
        onClose={() => setHistoryGoal(null)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  header: {
    marginBottom: SPACING.md,
    marginTop: SPACING.xs,
  },
  dateKicker: {
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    marginBottom: SPACING.md,
  },
  budgetCard: {
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
    gap: 6,
  },
  budgetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  emptyBudgetContainer: {
    paddingVertical: SPACING.xs,
    gap: SPACING.sm,
  },
  emptyBudgetText: {
    lineHeight: 18,
  },
  createBudgetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: SPACING.xs + 3,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  transactionListContainer: {
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    overflow: 'hidden',
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
  bottomActionContainer: {
    marginTop: SPACING.xs,
    marginBottom: SPACING.lg,
  },
});
