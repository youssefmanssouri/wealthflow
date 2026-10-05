import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useFinancial } from '../context/FinancialContext';
import { formatCurrency } from '../utils/currency';
import { formatDate } from '../utils/date';
import { SPACING, RADIUS } from '../constants/theme';
import { AppText } from '../components/ui/AppText';
import { Icon } from '../components/ui/Icon';
import { Badge } from '../components/ui/Badge';
import { AppButton } from '../components/ui/AppButton';
import { Header } from '../components/ui/Header';
import { ConfirmationModal } from '../components/ui/ConfirmationModal';

export const TransactionDetailModal: React.FC<{ route: any; navigation: any }> = ({
  route,
  navigation,
}) => {
  const { transactionId } = route.params || {};
  const { colors, isDark } = useTheme();
  const { transactions, deleteTransaction, user } = useFinancial();
  const currency = user.preferences.currency;

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const transaction = transactions.find((t) => t.id === transactionId);

  if (!transaction) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <Header title="Transaction Details" showBack onBack={() => navigation.goBack()} />
        <View style={styles.notFoundContainer}>
          <AppText variant="md" color="secondary">
            Transaction not found or deleted.
          </AppText>
          <AppButton
            title="Go Back"
            onPress={() => navigation.goBack()}
            style={{ marginTop: SPACING.md }}
          />
        </View>
      </SafeAreaView>
    );
  }

  const isIncome = transaction.type === 'income';

  const handleDelete = async () => {
    if (isDeleting) return;
    setIsDeleting(true);

    try {
      const res = await deleteTransaction(transaction.id);
      if (res.success) {
        setShowDeleteConfirm(false);
        navigation.goBack();
      } else {
        setShowDeleteConfirm(false);
        Alert.alert(
          'Deletion Failed',
          res.error || 'Unable to delete this transaction. Please try again.'
        );
      }
    } catch (err: any) {
      setShowDeleteConfirm(false);
      Alert.alert(
        'Deletion Failed',
        err?.message || 'Unable to delete this transaction. Please try again.'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = () => {
    navigation.navigate('AddTransaction', { editTransactionId: transaction.id });
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <Header
        title="Transaction Details"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Main Amount & Entity Summary */}
        <View
          style={[
            styles.summaryCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View
            style={[
              styles.categoryIconBadge,
              { backgroundColor: (transaction.categoryColor || colors.primary) + '18' },
            ]}
          >
            <Icon
              name={transaction.categoryIcon}
              size={22}
              color={transaction.categoryColor || colors.primary}
              strokeWidth={2}
            />
          </View>

          <AppText
            variant="giant"
            weight="bold"
            color={isIncome ? 'positive' : 'primary'}
            style={styles.amountText}
          >
            {isIncome ? '+' : '−'}{formatCurrency(transaction.amount, currency)}
          </AppText>

          <AppText variant="md" weight="semibold" style={styles.merchantName}>
            {transaction.merchant}
          </AppText>

          <Badge
            label={isIncome ? 'Income' : 'Expense'}
            variant={isIncome ? 'positive' : 'negative'}
            style={{ marginTop: SPACING.sm }}
          />
        </View>

        {/* Detailed Fields List */}
        <View
          style={[
            styles.detailsCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={styles.detailRow}>
            <AppText variant="xs" color="secondary" weight="medium">
              Category
            </AppText>
            <View style={styles.categoryValue}>
              <View
                style={[
                  styles.miniDot,
                  { backgroundColor: transaction.categoryColor || colors.primary },
                ]}
              />
              <AppText variant="sm" weight="semibold">
                {transaction.categoryName}
              </AppText>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.detailRow}>
            <AppText variant="xs" color="secondary" weight="medium">
              Date
            </AppText>
            <AppText variant="sm" weight="medium">
              {formatDate(transaction.date)}
            </AppText>
          </View>

          {transaction.description ? (
            <>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <View style={styles.detailRow}>
                <AppText variant="xs" color="secondary" weight="medium">
                  Note
                </AppText>
                <AppText variant="sm" weight="medium" style={{ flex: 1, textAlign: 'right', marginLeft: SPACING.md }}>
                  {transaction.description}
                </AppText>
              </View>
            </>
          ) : null}

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.detailRow}>
            <AppText variant="xs" color="muted">
              Created
            </AppText>
            <AppText variant="xs" color="muted">
              {new Date(transaction.createdAt).toLocaleString()}
            </AppText>
          </View>
        </View>

        {/* Actions Row (Edit & Delete) */}
        <View style={styles.actionsContainer}>
          <AppButton
            title="Edit Transaction"
            onPress={handleEdit}
            variant="outline"
            size="md"
            icon="edit-3"
            fullWidth
            style={{ marginBottom: SPACING.sm }}
          />

          <AppButton
            title="Delete Transaction"
            onPress={() => setShowDeleteConfirm(true)}
            variant="danger"
            size="md"
            icon="trash-2"
            disabled={isDeleting}
            fullWidth
          />
        </View>
      </ScrollView>

      {/* Confirmation Modal */}
      <ConfirmationModal
        visible={showDeleteConfirm}
        title="Delete Transaction?"
        message={`Are you sure you want to delete "${transaction.merchant}" (${formatCurrency(
          transaction.amount,
          currency
        )})? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        isDanger
        loading={isDeleting}
        disabled={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => {
          if (!isDeleting) {
            setShowDeleteConfirm(false);
          }
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    padding: SPACING.md,
  },
  notFoundContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  summaryCard: {
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  categoryIconBadge: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  amountText: {
    letterSpacing: -0.5,
  },
  merchantName: {
    marginTop: 4,
  },
  detailsCard: {
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderWidth: 1,
    marginBottom: SPACING.lg,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm + 2,
  },
  categoryValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  miniDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  divider: {
    height: 1,
    width: '100%',
  },
  actionsContainer: {
    marginBottom: SPACING.xl,
  },
});
