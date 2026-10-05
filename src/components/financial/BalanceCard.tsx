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
  const monthName = currentMonth.split(' ')[0];
  const totalSavings = savingsGoals ? savingsGoals.reduce((sum, g) => sum + g.currentAmount, 0) : 0;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? colors.card : colors.surface,
          borderColor: colors.border,
        },
      ]}
    >
      {/* Balance Header & Action */}
      <View style={styles.topRow}>
        <View style={styles.balanceInfo}>
          <AppText variant="xs" color="secondary" weight="medium" style={styles.kicker}>
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
            style={[
              styles.addBtn,
              { backgroundColor: colors.primary },
            ]}
          >
            <Icon name="plus" size={16} color="#FFFFFF" strokeWidth={2} />
            <AppText variant="xs" weight="semibold" style={styles.addBtnText}>
              Add
            </AppText>
          </TouchableOpacity>
        )}
      </View>

      {/* Subtle Hairline Divider */}
      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      {/* Income & Expense Breakdown */}
      <View style={styles.statsRow}>
        <View style={styles.statColumn}>
          <View style={styles.statLabelRow}>
            <Icon name="arrow-down-left" size={13} color={colors.positive} strokeWidth={2} />
            <AppText variant="xs" color="secondary" weight="medium">
              Income ({monthName})
            </AppText>
          </View>
          <AppText variant="md" weight="bold" color="positive" style={styles.statValue}>
            {formatCurrency(monthlyIncome, currency, { showSign: true })}
          </AppText>
        </View>

        <View style={[styles.verticalDivider, { backgroundColor: colors.border }]} />

        <View style={styles.statColumn}>
          <View style={styles.statLabelRow}>
            <Icon name="arrow-up-right" size={13} color={colors.negative} strokeWidth={2} />
            <AppText variant="xs" color="secondary" weight="medium">
              Expenses ({monthName})
            </AppText>
          </View>
          <AppText variant="md" weight="bold" color="negative" style={styles.statValue}>
            {formatCurrency(monthlyExpenses, currency, { showSign: true })}
          </AppText>
        </View>
      </View>

      {/* Allocated Savings Metadata Row */}
      {totalSavings > 0 && (
        <>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.savingsRow}>
            <View style={styles.savingsLabelGroup}>
              <Icon name="target" size={13} color={colors.textSecondary} />
              <AppText variant="xs" color="secondary" weight="medium">
                Allocated to Goals
              </AppText>
            </View>
            <AppText variant="xs" weight="semibold" color="primary">
              {formatCurrency(totalSavings, currency)}
            </AppText>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    marginBottom: SPACING.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  balanceInfo: {
    flex: 1,
  },
  kicker: {
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  balanceText: {
    letterSpacing: -0.5,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: RADIUS.md,
    gap: 4,
    marginTop: 2,
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
  statColumn: {
    flex: 1,
  },
  statLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  statValue: {
    letterSpacing: -0.2,
  },
  verticalDivider: {
    width: 1,
    height: 32,
    marginHorizontal: SPACING.md,
  },
  savingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  savingsLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});
