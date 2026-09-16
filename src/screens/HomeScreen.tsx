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
import { Transaction, SavingsGoal } from '../types/financial';

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
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <AppText variant="xs" color="secondary" weight="medium">
              {currentMonth}
            </AppText>
            <AppText variant="xl" weight="bold" numberOfLines={1} ellipsizeMode="tail">
              {greeting}, {user.name || 'there'}
            </AppText>
          </View>
        </View>

        {/* Retryable Load Error Banner */}
        {loadError && (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={refreshFinancialData}
            style={[
              styles.errorBanner,
              { backgroundColor: colors.negative + '18', borderColor: colors.negative + '40' },
            ]}
          >
            <Icon name="AlertCircle" size={18} color={colors.negative} />
            <AppText
              variant="xs"
              weight="medium"
              style={{ flex: 1, color: colors.negative, marginLeft: 8 }}
            >
              {loadError} Tap to retry.
            </AppText>
            <Icon name="RefreshCw" size={14} color={colors.negative} />
          </TouchableOpacity>
        )}

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
                {monthlyBudgetTotal > 0 ? 'View All' : 'Set Budget'}
              </AppText>
            </TouchableOpacity>
          </View>

          {monthlyBudgetTotal > 0 ? (
            <>
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
            </>
          ) : (
            <View style={styles.emptyBudgetContainer}>
              <AppText variant="xs" color="secondary" style={styles.emptyBudgetText}>
                Set category spending limits to keep monthly expenses on track.
              </AppText>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => navigation.navigate('BudgetTab')}
                style={[
                  styles.createBudgetBtn,
                  { backgroundColor: colors.primaryLight, borderColor: colors.primary + '30' },
                ]}
              >
                <Icon name="plus" size={14} color={colors.primary} />
                <AppText variant="xs" weight="bold" color="brand">
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
    marginTop: SPACING.xs,
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
