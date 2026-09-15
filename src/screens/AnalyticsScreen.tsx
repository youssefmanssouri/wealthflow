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

        {/* Net Savings Metric Banner */}
        <View
          style={[
            styles.metricBanner,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View>
            <AppText variant="xs" color="secondary" weight="medium">
              MONTHLY NET SAVINGS
            </AppText>
            <AppText
              variant="xl"
              weight="bold"
              color={netSavings >= 0 ? 'positive' : 'negative'}
            >
              {formatCurrency(netSavings, currency, { showSign: true })}
            </AppText>
          </View>

          <View style={styles.savingsRateBadge}>
            <AppText variant="xs" color="secondary">
              Savings Rate
            </AppText>
            <AppText
              variant="md"
              weight="bold"
              color={savingsRate >= 20 ? 'positive' : savingsRate > 0 ? 'brand' : 'negative'}
            >
              {savingsRate}%
            </AppText>
          </View>
        </View>

        {/* Actionable Financial Insights */}
        {financialInsights.length > 0 && (
          <View style={styles.section}>
            <AppText variant="lg" weight="bold" style={styles.sectionTitle}>
              Smart Financial Insights
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
          <AppText variant="lg" weight="bold">
            Spending by Category
          </AppText>
          <AppText variant="xs" color="secondary" style={{ marginBottom: SPACING.sm }}>
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
          <AppText variant="lg" weight="bold">
            Income vs Expenses
          </AppText>
          <AppText variant="xs" color="secondary" style={{ marginBottom: SPACING.sm }}>
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
          <AppText variant="lg" weight="bold">
            Spending Trajectory
          </AppText>
          <AppText variant="xs" color="secondary" style={{ marginBottom: SPACING.sm }}>
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
  },
  metricBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    marginBottom: SPACING.lg,
  },
  savingsRateBadge: {
    alignItems: 'flex-end',
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    marginBottom: SPACING.sm,
  },
  chartCard: {
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    marginBottom: SPACING.lg,
  },
});
