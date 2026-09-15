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
import { formatCurrency } from '../utils/currency';
import { getCurrentMonthYear } from '../utils/date';
import { SPACING, RADIUS } from '../constants/theme';
import { AppText } from '../components/ui/AppText';
import { Header } from '../components/ui/Header';
import { ProgressBar } from '../components/ui/ProgressBar';
import { BudgetCategoryCard } from '../components/financial/BudgetCategoryCard';
import { AppButton } from '../components/ui/AppButton';
import { EmptyState } from '../components/ui/EmptyState';
import { Icon } from '../components/ui/Icon';

export const BudgetScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const {
    user,
    budgets,
    monthlyBudgetTotal,
    monthlyBudgetSpent,
    isRefreshing,
    loadError,
    refreshFinancialData,
  } = useFinancial();

  const currentMonth = getCurrentMonthYear();
  const currency = user.preferences.currency;

  const remainingBudget = monthlyBudgetTotal - monthlyBudgetSpent;
  const overallProgress = monthlyBudgetTotal > 0 ? monthlyBudgetSpent / monthlyBudgetTotal : 0;
  const overallPercentage = Math.round(overallProgress * 100);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <Header
        title="Budget Management"
        subtitle={currentMonth}
        rightActionIcon="plus"
        onRightAction={() => navigation.navigate('EditBudget')}
      />

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

        {/* Total Monthly Budget Overview Card */}
        <View
          style={[
            styles.overviewCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={styles.cardTopRow}>
            <View>
              <AppText variant="xs" color="secondary" weight="medium">
                MONTHLY SPENDING LIMIT
              </AppText>
              <AppText variant="xxl" weight="bold">
                {formatCurrency(monthlyBudgetTotal, currency)}
              </AppText>
            </View>
            <AppButton
              title="Set Limit"
              onPress={() => navigation.navigate('EditBudget')}
              variant="outline"
              size="sm"
              icon="edit-3"
            />
          </View>

          <ProgressBar progress={overallProgress} height={10} style={{ marginVertical: SPACING.md }} />

          <View style={styles.statsGrid}>
            <View>
              <AppText variant="xs" color="secondary">
                Total Spent
              </AppText>
              <AppText variant="md" weight="bold">
                {formatCurrency(monthlyBudgetSpent, currency)}
              </AppText>
            </View>

            <View style={{ alignItems: 'center' }}>
              <AppText variant="xs" color="secondary">
                Remaining
              </AppText>
              <AppText
                variant="md"
                weight="bold"
                color={remainingBudget < 0 ? 'negative' : 'positive'}
              >
                {formatCurrency(Math.max(0, remainingBudget), currency)}
              </AppText>
            </View>

            <View style={{ alignItems: 'flex-end' }}>
              <AppText variant="xs" color="secondary">
                Used Rate
              </AppText>
              <AppText
                variant="md"
                weight="bold"
                color={overallPercentage >= 100 ? 'negative' : 'primary'}
              >
                {overallPercentage}%
              </AppText>
            </View>
          </View>
        </View>

        {/* Category-Level Budgets Header */}
        <View style={styles.sectionHeader}>
          <AppText variant="lg" weight="bold">
            Category Budgets
          </AppText>
          <TouchableOpacity onPress={() => navigation.navigate('EditBudget')}>
            <AppText variant="xs" weight="bold" color="brand">
              + Manage Budgets
            </AppText>
          </TouchableOpacity>
        </View>

        {/* Category Budget List */}
        {budgets.length > 0 ? (
          budgets.map((bgt) => (
            <BudgetCategoryCard
              key={bgt.id}
              budget={bgt}
              onEdit={() => navigation.navigate('EditBudget', { categoryId: bgt.categoryId })}
            />
          ))
        ) : loadError ? (
          <EmptyState
            icon="AlertCircle"
            title="Unable to Load Budgets"
            description={loadError}
            actionLabel="Try Again"
            onAction={refreshFinancialData}
          />
        ) : (
          <EmptyState
            icon="pie-chart"
            title="No Category Budgets Set"
            description="Create monthly spend limits for Food, Transport, Shopping and more to keep your expenses controlled."
            actionLabel="Set Category Budget"
            onAction={() => navigation.navigate('EditBudget')}
          />
        )}
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
  overviewCard: {
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    marginBottom: SPACING.lg,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
});
