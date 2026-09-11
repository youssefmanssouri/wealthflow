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
        return <Badge label="Warning (80%)" variant="warning" />;
      case 'over_budget':
        return <Badge label="Over Budget" variant="over_budget" />;
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
            style={[styles.iconWrapper, { backgroundColor: category.color + '20' }]}
          >
            <Icon name={category.icon} size={20} color={category.color} />
          </View>
          <View>
            <AppText variant="md" weight="semibold">
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
              style={[styles.editBtn, { backgroundColor: colors.inputBg }]}
            >
              <Icon name="edit-3" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ProgressBar progress={ratio} height={8} style={styles.progressBar} />

      <View style={styles.footer}>
        <View>
          <AppText variant="xs" color="secondary">
            Spent
          </AppText>
          <AppText
            variant="sm"
            weight="bold"
            color={status === 'over_budget' ? 'negative' : 'primary'}
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
            weight="bold"
            color={remaining < 0 ? 'negative' : 'positive'}
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
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    marginBottom: SPACING.md,
  },
  header: {
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  editBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.xs,
  },
  progressBar: {
    marginBottom: SPACING.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
