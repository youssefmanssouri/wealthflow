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
  variant?: 'card' | 'flat';
  hideBorder?: boolean;
  style?: any;
}

interface TransactionRowContentProps extends TransactionRowProps {
  currency: Currency;
}

const TransactionRowContent: React.FC<TransactionRowContentProps> = React.memo(
  ({ transaction, onPress, currency, variant = 'card', hideBorder = false, style }) => {
    const { colors } = useTheme();
    const isIncome = transaction.type === 'income';

    const handlePress = () => {
      if (onPress) {
        (onPress as (id: string) => void)(transaction.id);
      }
    };

    const isFlat = variant === 'flat';

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={handlePress}
        style={[
          isFlat ? styles.flatRow : styles.cardRow,
          isFlat
            ? {
                borderBottomColor: colors.border,
                borderBottomWidth: hideBorder ? 0 : 1,
              }
            : {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
          style,
        ]}
      >
        <View
          style={[
            styles.iconBadge,
            { backgroundColor: (transaction.categoryColor || colors.primary) + '18' },
          ]}
        >
          <Icon
            name={transaction.categoryIcon}
            size={16}
            color={transaction.categoryColor || colors.primary}
            strokeWidth={2}
          />
        </View>

        <View style={styles.details}>
          <AppText variant="sm" weight="medium" numberOfLines={1} style={styles.merchantText}>
            {transaction.merchant}
          </AppText>
          <AppText variant="xs" color="secondary" numberOfLines={1}>
            {transaction.categoryName} • {formatRelativeDate(transaction.date)}
          </AppText>
        </View>

        <View style={styles.amountSection}>
          <AppText
            variant="sm"
            weight="semibold"
            color={isIncome ? 'positive' : 'primary'}
            align="right"
          >
            {isIncome ? '+' : '−'}{formatCurrency(transaction.amount, currency)}
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
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    marginBottom: SPACING.xs + 2,
  },
  flatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm + 3,
    paddingHorizontal: SPACING.md,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm + 4,
  },
  details: {
    flex: 1,
    justifyContent: 'center',
  },
  merchantText: {
    marginBottom: 2,
  },
  amountSection: {
    alignItems: 'flex-end',
    marginLeft: SPACING.sm,
  },
});
