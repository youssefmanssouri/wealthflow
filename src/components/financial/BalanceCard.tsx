import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useFinancial } from '../../context/FinancialContext';
import { formatCurrency } from '../../utils/currency';
import { getCurrentMonthYear } from '../../utils/date';
import { RADIUS, SPACING } from '../../constants/theme';
import { AppText } from '../ui/AppText';
import { Icon } from '../ui/Icon';

export interface BalanceCardProps {
  onAddTransaction?: () => void;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({ onAddTransaction }) => {
  const { colors, isDark } = useTheme();
  const { totalBalance, monthlyIncome, monthlyExpenses, savingsGoals, user } = useFinancial();
  const currency = user.preferences.currency;

  const currentMonth = getCurrentMonthYear();
  const totalSavings = savingsGoals ? savingsGoals.reduce((sum, g) => sum + g.currentAmount, 0) : 0;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: isDark ? colors.card : colors.surface,
          borderColor: colors.border,
        },
      ]}
    >
      {/* Top Banner Row */}
      <View style={styles.topRow}>
        <View>
          <AppText variant="xs" color="secondary" weight="medium">
            TOTAL BALANCE
          </AppText>
          <AppText variant="giant" weight="bold" style={styles.balanceText}>
            {formatCurrency(totalBalance, currency)}
          </AppText>
        </View>

        {onAddTransaction && (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onAddTransaction}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Add new transaction"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={[styles.addBtn, { backgroundColor: colors.primary }]}
          >
            <Icon name="plus" size={20} color="#FFFFFF" strokeWidth={2.5} />
            <AppText variant="sm" weight="bold" style={styles.addBtnText}>
              Add
            </AppText>
          </TouchableOpacity>
        )}
      </View>

      {/* Divider */}
      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      {/* Income & Expense Breakdown */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <View style={[styles.iconBadge, { backgroundColor: colors.positiveBg }]}>
            <Icon name="arrow-down-left" size={18} color={colors.positive} strokeWidth={2.5} />
          </View>
          <View>
            <AppText variant="xs" color="secondary" weight="medium">
              Income ({currentMonth.split(' ')[0]})
            </AppText>
            <AppText variant="md" weight="bold" color="positive">
              {formatCurrency(monthlyIncome, currency, { showSign: true })}
            </AppText>
          </View>
        </View>

        <View style={styles.statItem}>
          <View style={[styles.iconBadge, { backgroundColor: colors.negativeBg }]}>
            <Icon name="arrow-up-right" size={18} color={colors.negative} strokeWidth={2.5} />
          </View>
          <View>
            <AppText variant="xs" color="secondary" weight="medium">
              Expenses ({currentMonth.split(' ')[0]})
            </AppText>
            <AppText variant="md" weight="bold" color="negative">
              {formatCurrency(monthlyExpenses, currency, { showSign: true })}
            </AppText>
          </View>
        </View>
      </View>

      {/* Allocated Savings Badge (shown when user has active savings) */}
      {totalSavings > 0 ? (
        <View
          style={[
            styles.savingsAllocationBadge,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={styles.savingsAllocationLeft}>
            <View style={[styles.miniSavingsIcon, { backgroundColor: colors.primaryLight }]}>
              <Icon name="target" size={14} color={colors.primary} />
            </View>
            <AppText variant="xs" color="secondary" weight="medium">
              Total Saved (Allocated)
            </AppText>
          </View>
          <AppText variant="xs" weight="bold" color="brand">
            {formatCurrency(totalSavings, currency)}
          </AppText>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: SPACING.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  balanceText: {
    marginTop: SPACING.xs,
    letterSpacing: -0.5,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs + 2,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.full,
    gap: 4,
  },
  addBtnText: {
    color: '#FFFFFF',
  },
  divider: {
    height: 1,
    marginVertical: SPACING.md,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  savingsAllocationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    paddingHorizontal: SPACING.sm + 2,
    borderRadius: RADIUS.md,
    borderWidth: 1,
  },
  savingsAllocationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs + 2,
  },
  miniSavingsIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
