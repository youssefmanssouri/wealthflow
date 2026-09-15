import React from 'react';
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
import { SPACING, RADIUS } from '../constants/theme';
import { AppText } from '../components/ui/AppText';
import { Header } from '../components/ui/Header';
import { ProgressBar } from '../components/ui/ProgressBar';
import { SavingsGoalCard } from '../components/financial/SavingsGoalCard';
import { EmptyState } from '../components/ui/EmptyState';
import { AppButton } from '../components/ui/AppButton';
import { Icon } from '../components/ui/Icon';

export const SavingsGoalsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const {
    savingsGoals,
    user,
    isRefreshing,
    loadError,
    refreshFinancialData,
  } = useFinancial();

  const currency = user.preferences.currency;

  const totalSaved = savingsGoals.reduce((sum, g) => sum + g.currentAmount, 0);
  const totalTarget = savingsGoals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalRemaining = Math.max(0, totalTarget - totalSaved);
  const rawRatio = totalTarget > 0 ? totalSaved / totalTarget : 0;
  const progressRatio = Math.min(1, Math.max(0, rawRatio));
  const overallPercentage = Math.round(rawRatio * 100);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <Header
        title="Savings Goals"
        subtitle={`${savingsGoals.length} ${savingsGoals.length === 1 ? 'Goal' : 'Goals'}`}
        showBack
        onBack={() => navigation.goBack()}
        rightActionIcon="plus"
        onRightAction={() => navigation.navigate('AddSavingsGoal')}
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

        {/* Cumulative Savings Overview Card */}
        <View
          style={[
            styles.overviewCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={styles.cardTopRow}>
            <View>
              <AppText variant="xs" color="secondary" weight="medium">
                TOTAL SAVINGS ACCUMULATED
              </AppText>
              <AppText variant="xxl" weight="bold" color="positive">
                {formatCurrency(totalSaved, currency)}
              </AppText>
            </View>
            <AppButton
              title="New Goal"
              onPress={() => navigation.navigate('AddSavingsGoal')}
              variant="outline"
              size="sm"
              icon="plus"
            />
          </View>

          <ProgressBar
            progress={progressRatio}
            height={10}
            style={{ marginVertical: SPACING.md }}
          />

          <View style={styles.statsGrid}>
            <View>
              <AppText variant="xs" color="secondary">
                Cumulative Target
              </AppText>
              <AppText variant="md" weight="bold">
                {formatCurrency(totalTarget, currency)}
              </AppText>
            </View>

            <View style={{ alignItems: 'center' }}>
              <AppText variant="xs" color="secondary">
                Remaining to Save
              </AppText>
              <AppText
                variant="md"
                weight="bold"
                color={totalRemaining === 0 && totalTarget > 0 ? 'positive' : 'primary'}
              >
                {formatCurrency(totalRemaining, currency)}
              </AppText>
            </View>

            <View style={{ alignItems: 'flex-end' }}>
              <AppText variant="xs" color="secondary">
                Overall Progress
              </AppText>
              <AppText
                variant="md"
                weight="bold"
                color={overallPercentage >= 100 ? 'positive' : 'brand'}
              >
                {overallPercentage}%
              </AppText>
            </View>
          </View>
        </View>

        {/* Section Header */}
        <View style={styles.sectionHeader}>
          <AppText variant="lg" weight="bold">
            All Savings Goals
          </AppText>
          <TouchableOpacity onPress={() => navigation.navigate('AddSavingsGoal')}>
            <AppText variant="xs" weight="bold" color="brand">
              + New Goal
            </AppText>
          </TouchableOpacity>
        </View>

        {/* Complete Goals List — Renders all goals without slicing */}
        {savingsGoals.length > 0 ? (
          savingsGoals.map((goal) => (
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
          ))
        ) : loadError ? (
          <EmptyState
            icon="AlertCircle"
            title="Unable to Load Savings Goals"
            description={loadError}
            actionLabel="Try Again"
            onAction={refreshFinancialData}
          />
        ) : (
          <EmptyState
            icon="target"
            title="No Savings Goals Yet"
            description="Set financial targets for emergencies, a down payment, or future milestones."
            actionLabel="Create Savings Goal"
            onAction={() => navigation.navigate('AddSavingsGoal')}
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
    paddingBottom: SPACING.xxl,
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
