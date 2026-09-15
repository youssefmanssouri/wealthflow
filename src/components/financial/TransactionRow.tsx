import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useFinancial } from '../../context/FinancialContext';
import { Transaction, Currency } from '../../types/financial';
import { formatCurrency } from '../../utils/currency';
import { formatRelativeDate } from '../../utils/date';
import { RADIUS, SPACING } from '../../constants/theme';
import { AppText } from '../ui/AppText';
import { Icon } from '../ui/Icon';

export interface TransactionRowProps {
  transaction: Transaction;
  onPress?: ((id: string) => void) | (() => void);
  currency?: Currency;
}

interface TransactionRowContentProps {
  transaction: Transaction;
  onPress?: ((id: string) => void) | (() => void);
  currency: Currency;
}

const TransactionRowContent: React.FC<TransactionRowContentProps> = React.memo(
  ({ transaction, onPress, currency }) => {
    const { colors } = useTheme();
    const isIncome = transaction.type === 'income';

    const handlePress = () => {
      if (onPress) {
        (onPress as (id: string) => void)(transaction.id);
      }
    };

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={handlePress}
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
  }
);

TransactionRowContent.displayName = 'TransactionRowContent';

const TransactionRowWithContext: React.FC<TransactionRowProps> = React.memo((props) => {
  const { user } = useFinancial();
  return <TransactionRowContent {...props} currency={user.preferences.currency} />;
});

TransactionRowWithContext.displayName = 'TransactionRowWithContext';

export const TransactionRow: React.FC<TransactionRowProps> = React.memo((props) => {
  if (props.currency) {
    return <TransactionRowContent {...props} currency={props.currency} />;
  }
  return <TransactionRowWithContext {...props} />;
});

TransactionRow.displayName = 'TransactionRow';

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
