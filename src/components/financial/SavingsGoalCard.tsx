import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useFinancial } from '../../context/FinancialContext';
import { SavingsGoal } from '../../types/financial';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/date';
import { RADIUS, SPACING } from '../../constants/theme';
import { AppText } from '../ui/AppText';
import { ProgressBar } from '../ui/ProgressBar';
import { Icon } from '../ui/Icon';

export interface SavingsGoalCardProps {
  goal: SavingsGoal;
  onContribute?: () => void;
}

export const SavingsGoalCard: React.FC<SavingsGoalCardProps> = ({ goal, onContribute }) => {
  const { colors } = useTheme();
  const { user } = useFinancial();
  const currency = user.preferences.currency;

  const ratio = goal.targetAmount > 0 ? goal.currentAmount / goal.targetAmount : 0;
  const percentage = Math.round(ratio * 100);

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
      ]}
    >
      <View style={styles.topRow}>
        <View style={styles.titleGroup}>
          <View style={[styles.iconWrapper, { backgroundColor: goal.color + '20' }]}>
            <Icon name={goal.icon} size={20} color={goal.color} />
          </View>
          <View>
            <AppText variant="md" weight="bold">
              {goal.name}
            </AppText>
            <AppText variant="xs" color="secondary">
              Target Date: {formatDate(goal.targetDate)}
            </AppText>
          </View>
        </View>

        <View style={[styles.badge, { backgroundColor: colors.positiveBg }]}>
          <AppText variant="xs" weight="bold" color="positive">
            {percentage}%
          </AppText>
        </View>
      </View>

      <ProgressBar
        progress={ratio}
        color={goal.color}
        height={8}
        style={styles.progressBar}
      />

      <View style={styles.bottomRow}>
        <View>
          <AppText variant="xs" color="secondary">
            Saved
          </AppText>
          <AppText variant="sm" weight="bold">
            {formatCurrency(goal.currentAmount, currency)}{' '}
            <AppText variant="xs" color="muted">
              / {formatCurrency(goal.targetAmount, currency)}
            </AppText>
          </AppText>
        </View>

        {onContribute && (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onContribute}
            style={[styles.contributeBtn, { backgroundColor: colors.primaryLight }]}
          >
            <Icon name="plus" size={16} color={colors.primary} />
            <AppText variant="xs" weight="bold" color="brand">
              Add Savings
            </AppText>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    marginBottom: SPACING.sm,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  progressBar: {
    marginBottom: SPACING.md,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  contributeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm + 2,
    borderRadius: RADIUS.full,
  },
});
