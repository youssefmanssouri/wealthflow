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
  onViewHistory?: () => void;
}

export const SavingsGoalCard: React.FC<SavingsGoalCardProps> = ({
  goal,
  onContribute,
  onEdit,
  onViewHistory,
}) => {
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
      {/* Top Header Row */}
      <View style={styles.topRow}>
        <View style={styles.titleGroup}>
          <View
            style={[
              styles.iconWrapper,
              { backgroundColor: (goal.color || colors.primary) + '15' },
            ]}
          >
            <Icon
              name={goal.icon}
              size={16}
              color={goal.color || colors.primary}
              strokeWidth={2}
            />
          </View>
          <View style={{ flex: 1 }}>
            <AppText variant="sm" weight="semibold" numberOfLines={1}>
              {goal.name}
            </AppText>
            <AppText variant="xs" color="secondary">
              Target: {formatDate(goal.targetDate)}
            </AppText>
          </View>
        </View>

        <View style={styles.actionGroup}>
          <View
            style={[
              styles.percentageTag,
              {
                backgroundColor: isCompleted ? colors.positiveBg : colors.surface,
                borderColor: isCompleted ? colors.positive + '30' : colors.border,
              },
            ]}
          >
            <AppText
              variant="xs"
              weight="semibold"
              color={isCompleted ? 'positive' : 'secondary'}
            >
              {percentage}%
            </AppText>
          </View>

          {onViewHistory && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onViewHistory}
              style={[
                styles.iconBtn,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`View contribution history for ${goal.name}`}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Icon name="history" size={13} color={colors.textSecondary} />
            </TouchableOpacity>
          )}

          {onEdit && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onEdit}
              style={[
                styles.iconBtn,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`Edit ${goal.name} savings goal`}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Icon name="edit-3" size={13} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Thin Restrained Progress Bar */}
      <ProgressBar
        progress={progressRatio}
        color={isCompleted ? colors.positive : colors.primary}
        height={5}
        style={styles.progressBar}
      />

      {/* Bottom Financial Figures & Contribution Trigger */}
      <View style={styles.bottomRow}>
        <View>
          <AppText variant="sm" weight="semibold">
            {formatCurrency(goal.currentAmount, currency)}{' '}
            <AppText variant="xs" color="muted">
              / {formatCurrency(goal.targetAmount, currency)}
            </AppText>
          </AppText>
          <AppText variant="xs" color="secondary" style={{ marginTop: 2 }}>
            {isCompleted ? 'Target Achieved' : `Remaining: ${formatCurrency(remaining, currency)}`}
          </AppText>
        </View>

        {onContribute && (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onContribute}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={`Add savings to ${goal.name}`}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={[
              styles.contributeBtn,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Icon name="plus" size={13} color={colors.primary} />
            <AppText variant="xs" weight="medium" color="brand">
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
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    marginBottom: SPACING.sm + 2,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs + 2,
    gap: SPACING.sm,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  percentageTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
  },
  iconBtn: {
    width: 28,
    height: 28,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBar: {
    marginVertical: SPACING.xs + 4,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  contributeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
  },
});
