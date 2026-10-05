import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useFinancial } from '../context/FinancialContext';
import { getCurrentMonthYear } from '../utils/date';
import { formatCurrency } from '../utils/currency';
import { SPACING, RADIUS } from '../constants/theme';
import { AppText } from '../components/ui/AppText';
import { Header } from '../components/ui/Header';
import { CategoryDonutChart } from '../components/charts/CategoryDonutChart';
import { IncomeExpenseBarChart } from '../components/charts/IncomeExpenseBarChart';
import { SpendingTrendChart } from '../components/charts/SpendingTrendChart';
import { InsightCard } from '../components/financial/InsightCard';
import { EmptyState } from '../components/ui/EmptyState';
import { Icon } from '../components/ui/Icon';

export const AnalyticsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const {
    user,
    monthlyIncome,
    monthlyExpenses,
    categorySpending,
    monthlyTrends,
    financialInsights,
    isRefreshing,
    loadError,
    refreshFinancialData,
  } = useFinancial();

  const currentMonth = getCurrentMonthYear();
  const currency = user.preferences.currency;

  const netSavings = monthlyIncome - monthlyExpenses;
  const savingsRate = monthlyIncome > 0 ? Math.round((netSavings / monthlyIncome) * 100) : 0;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <Header title="Financial Analytics" />

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

        {/* Net Savings Metric Banner */}
        <View
          style={[
            styles.metricBanner,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View>
            <AppText variant="xs" color="secondary" weight="medium" style={styles.kicker}>
              MONTHLY NET SAVINGS
            </AppText>
            <AppText
              variant="xl"
              weight="bold"
              color={netSavings >= 0 ? 'positive' : 'negative'}
              style={styles.netSavingsAmount}
            >
              {formatCurrency(netSavings, currency, { showSign: true })}
            </AppText>
          </View>

          <View style={styles.savingsRateCol}>
            <AppText variant="xs" color="secondary">
              Savings Rate
            </AppText>
            <AppText
              variant="md"
              weight="bold"
              color={savingsRate >= 20 ? 'positive' : savingsRate > 0 ? 'brand' : 'negative'}
              style={{ marginTop: 2 }}
            >
              {savingsRate}%
            </AppText>
          </View>
        </View>

        {/* Spending Analysis Section */}
        {financialInsights.length > 0 && (
          <View style={styles.section}>
            <AppText variant="sm" weight="semibold" style={styles.sectionTitle}>
              Spending Analysis
            </AppText>
            {financialInsights.map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </View>
        )}

        {/* Spending by Category Donut Chart */}
        <View
          style={[
            styles.chartCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <AppText variant="sm" weight="semibold">
            Spending by Category
          </AppText>
          <AppText variant="xs" color="secondary" style={{ marginTop: 2, marginBottom: SPACING.sm }}>
            Distribution of expenses for {currentMonth}
          </AppText>

          {categorySpending.length > 0 ? (
            <CategoryDonutChart data={categorySpending} />
          ) : (
            <EmptyState
              icon="pie-chart"
              title="No Category Expenses"
              description="Add expense transactions to unlock category distribution analytics."
            />
          )}
        </View>

        {/* Income vs Expenses Bar Comparison */}
        <View
          style={[
            styles.chartCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <AppText variant="sm" weight="semibold">
            Income vs Expenses
          </AppText>
          <AppText variant="xs" color="secondary" style={{ marginTop: 2, marginBottom: SPACING.sm }}>
            6-Month Cash Flow Comparison
          </AppText>

          <IncomeExpenseBarChart data={monthlyTrends} />
        </View>

        {/* 6-Month Spending Trend Line Chart */}
        <View
          style={[
            styles.chartCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <AppText variant="sm" weight="semibold">
            Spending Trajectory
          </AppText>
          <AppText variant="xs" color="secondary" style={{ marginTop: 2, marginBottom: SPACING.sm }}>
            Monthly expense trend curve
          </AppText>

          <SpendingTrendChart data={monthlyTrends} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
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
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  metricBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    marginBottom: SPACING.lg,
  },
  kicker: {
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  netSavingsAmount: {
    letterSpacing: -0.3,
  },
  savingsRateCol: {
    alignItems: 'flex-end',
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    marginBottom: SPACING.sm,
  },
  chartCard: {
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    marginBottom: SPACING.lg,
  },
});
