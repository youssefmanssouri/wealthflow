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
import { SavingsGoal } from '../types/financial';
import { formatCurrency } from '../utils/currency';
import { SPACING, RADIUS } from '../constants/theme';
import { AppText } from '../components/ui/AppText';
import { Header } from '../components/ui/Header';
import { ProgressBar } from '../components/ui/ProgressBar';
import { SavingsGoalCard } from '../components/financial/SavingsGoalCard';
import { ContributionHistoryModal } from '../components/financial/ContributionHistoryModal';
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

  const [historyGoal, setHistoryGoal] = useState<SavingsGoal | null>(null);

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

        {/* Cumulative Savings Overview Card */}
        {savingsGoals.length > 0 && (
          <View
            style={[
              styles.overviewCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={styles.cardTopRow}>
              <View>
                <AppText variant="xs" color="secondary" weight="medium" style={styles.kicker}>
                  TOTAL SAVINGS ACCUMULATED
                </AppText>
                <AppText variant="giant" weight="bold" color="positive" style={styles.savedAmount}>
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
              height={6}
              style={{ marginVertical: SPACING.md }}
            />

            <View style={styles.statsGrid}>
              <View style={styles.statCol}>
                <AppText variant="xs" color="secondary">
                  Cumulative Target
                </AppText>
                <AppText variant="sm" weight="semibold" style={{ marginTop: 2 }}>
                  {formatCurrency(totalTarget, currency)}
                </AppText>
              </View>

              <View style={[styles.statDivider, { backgroundColor: colors.border }]} />

              <View style={[styles.statCol, { alignItems: 'center' }]}>
                <AppText variant="xs" color="secondary">
                  Remaining to Save
                </AppText>
                <AppText
                  variant="sm"
                  weight="semibold"
                  color={totalRemaining === 0 && totalTarget > 0 ? 'positive' : 'primary'}
                  style={{ marginTop: 2 }}
                >
                  {formatCurrency(totalRemaining, currency)}
                </AppText>
              </View>

              <View style={[styles.statDivider, { backgroundColor: colors.border }]} />

              <View style={[styles.statCol, { alignItems: 'flex-end' }]}>
                <AppText variant="xs" color="secondary">
                  Overall Progress
                </AppText>
                <AppText
                  variant="sm"
                  weight="semibold"
                  color={overallPercentage >= 100 ? 'positive' : 'brand'}
                  style={{ marginTop: 2 }}
                >
                  {overallPercentage}%
                </AppText>
              </View>
            </View>
          </View>
        )}

        {/* Section Header */}
        {savingsGoals.length > 0 && (
          <View style={styles.sectionHeader}>
            <AppText variant="sm" weight="semibold">
              All Savings Goals
            </AppText>
            <TouchableOpacity
              onPress={() => navigation.navigate('AddSavingsGoal')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <AppText variant="xs" weight="medium" color="brand">
                + New Goal
              </AppText>
            </TouchableOpacity>
          </View>
        )}

        {/* Complete Goals List */}
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
              onViewHistory={() => setHistoryGoal(goal)}
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
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    marginBottom: SPACING.lg,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  kicker: {
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  savedAmount: {
    letterSpacing: -0.5,
  },
  statsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statCol: {
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 24,
    marginHorizontal: SPACING.xs,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm + 2,
  },
});
