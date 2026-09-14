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
  onEdit?: () => void;
}

export const SavingsGoalCard: React.FC<SavingsGoalCardProps> = ({ goal, onContribute, onEdit }) => {
  const { colors } = useTheme();
  const { user } = useFinancial();
  const currency = user.preferences.currency;

  const rawRatio = goal.targetAmount > 0 ? goal.currentAmount / goal.targetAmount : 0;
  const progressRatio = Math.min(1, Math.max(0, rawRatio));
  const percentage = Math.round(rawRatio * 100);
  const isCompleted = goal.targetAmount > 0 && goal.currentAmount >= goal.targetAmount;
  const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

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
          <View style={{ flex: 1 }}>
            <AppText variant="md" weight="bold" numberOfLines={1}>
              {goal.name}
            </AppText>
            <AppText variant="xs" color="secondary">
              Target Date: {formatDate(goal.targetDate)}
            </AppText>
          </View>
        </View>

        <View style={styles.badgeRow}>
          <View style={[styles.badge, { backgroundColor: isCompleted ? colors.positiveBg : colors.inputBg }]}>
            <AppText variant="xs" weight="bold" color={isCompleted ? 'positive' : 'brand'}>
              {percentage}%
            </AppText>
          </View>
          {onEdit && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onEdit}
              style={[styles.editBtn, { backgroundColor: colors.inputBg }]}
              accessibilityLabel={`Edit ${goal.name}`}
            >
              <Icon name="edit-3" size={15} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ProgressBar
        progress={progressRatio}
        color={goal.color}
        height={8}
        style={styles.progressBar}
      />

      <View style={styles.bottomRow}>
        <View>
          <AppText variant="xs" color="secondary">
            {isCompleted ? 'Target Achieved' : `Remaining: ${formatCurrency(remaining, currency)}`}
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
    gap: SPACING.sm,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  editBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
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
