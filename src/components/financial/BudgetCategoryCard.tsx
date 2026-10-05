import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useFinancial } from '../../context/FinancialContext';
import { Budget } from '../../types/financial';
import { formatCurrency } from '../../utils/currency';
import { getBudgetStatus } from '../../utils/financial';
import { getCategoryById } from '../../constants/categories';
import { RADIUS, SPACING } from '../../constants/theme';
import { AppText } from '../ui/AppText';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';
import { Icon } from '../ui/Icon';

export interface BudgetCategoryCardProps {
  budget: Budget;
  onEdit?: () => void;
}

export const BudgetCategoryCard: React.FC<BudgetCategoryCardProps> = ({
  budget,
  onEdit,
}) => {
  const { colors } = useTheme();
  const { user } = useFinancial();
  const currency = user.preferences.currency;

  const category = getCategoryById(budget.categoryId);
  const status = getBudgetStatus(budget.spent, budget.limit);
  const ratio = budget.limit > 0 ? budget.spent / budget.limit : 0;
  const percentage = Math.round(ratio * 100);
  const remaining = budget.limit - budget.spent;

  const getStatusBadge = () => {
    switch (status) {
      case 'healthy':
        return <Badge label="Healthy" variant="healthy" />;
      case 'warning':
        return <Badge label="Warning" variant="warning" />;
      case 'over_budget':
        return <Badge label="Exceeded" variant="over_budget" />;
    }
  };

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
      <View style={styles.header}>
        <View style={styles.titleGroup}>
          <View
            style={[
              styles.iconWrapper,
              { backgroundColor: (category.color || colors.primary) + '15' },
            ]}
          >
            <Icon
              name={category.icon}
              size={16}
              color={category.color || colors.primary}
              strokeWidth={2}
            />
          </View>
          <View style={{ flex: 1 }}>
            <AppText variant="sm" weight="semibold" numberOfLines={1}>
              {budget.categoryName}
            </AppText>
            <AppText variant="xs" color="secondary">
              {percentage}% of {formatCurrency(budget.limit, currency)} limit
            </AppText>
          </View>
        </View>

        <View style={styles.headerRight}>
          {getStatusBadge()}
          {onEdit && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onEdit}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`Edit ${budget.categoryName} budget`}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={[
                styles.editBtn,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <Icon name="edit-3" size={13} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ProgressBar progress={ratio} height={5} style={styles.progressBar} />

      <View style={styles.footer}>
        <View>
          <AppText variant="xs" color="secondary">
            Spent
          </AppText>
          <AppText
            variant="sm"
            weight="semibold"
            color={status === 'over_budget' ? 'negative' : 'primary'}
            style={{ marginTop: 2 }}
          >
            {formatCurrency(budget.spent, currency)}
          </AppText>
        </View>

        <View style={{ alignItems: 'flex-end' }}>
          <AppText variant="xs" color="secondary">
            {remaining >= 0 ? 'Remaining' : 'Exceeded By'}
          </AppText>
          <AppText
            variant="sm"
            weight="semibold"
            color={remaining < 0 ? 'negative' : 'positive'}
            style={{ marginTop: 2 }}
          >
            {formatCurrency(Math.abs(remaining), currency)}
          </AppText>
        </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm + 2,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
    marginRight: SPACING.xs,
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  editBtn: {
    width: 28,
    height: 28,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBar: {
    marginVertical: SPACING.xs + 2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
});
