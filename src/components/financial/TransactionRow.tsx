import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useFinancial } from '../../context/FinancialContext';
import { Transaction } from '../../types/financial';
import { formatCurrency } from '../../utils/currency';
import { formatRelativeDate } from '../../utils/date';
import { RADIUS, SPACING } from '../../constants/theme';
import { AppText } from '../ui/AppText';
import { Icon } from '../ui/Icon';

export interface TransactionRowProps {
  transaction: Transaction;
  onPress?: () => void;
}

export const TransactionRow: React.FC<TransactionRowProps> = ({ transaction, onPress }) => {
  const { colors } = useTheme();
  const { user } = useFinancial();
  const currency = user.preferences.currency;

  const isIncome = transaction.type === 'income';

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[
        styles.row,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
      ]}
    >
      <View
        style={[
          styles.iconBadge,
          { backgroundColor: transaction.categoryColor + '20' },
        ]}
      >
        <Icon
          name={transaction.categoryIcon}
          size={20}
          color={transaction.categoryColor}
        />
      </View>

      <View style={styles.details}>
        <AppText variant="md" weight="semibold" numberOfLines={1}>
          {transaction.merchant}
        </AppText>
        <AppText variant="xs" color="secondary" numberOfLines={1}>
          {transaction.categoryName} • {formatRelativeDate(transaction.date)}
        </AppText>
      </View>

      <View style={styles.amountSection}>
        <AppText
          variant="md"
          weight="bold"
          color={isIncome ? 'positive' : 'primary'}
          align="right"
        >
          {formatCurrency(transaction.amount, currency, { showSign: isIncome })}
        </AppText>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    marginBottom: SPACING.sm,
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  details: {
    flex: 1,
    justifyContent: 'center',
  },
  amountSection: {
    alignItems: 'flex-end',
  },
});
