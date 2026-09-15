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

      <ScrollView contentContainerStyle={styles.content}>
        {/* Main Amount Header Card */}
        <View
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View
            style={[
              styles.categoryIconBadge,
              { backgroundColor: transaction.categoryColor + '20' },
            ]}
          >
            <Icon
              name={transaction.categoryIcon}
              size={32}
              color={transaction.categoryColor}
            />
          </View>

          <AppText variant="giant" weight="bold" color={isIncome ? 'positive' : 'primary'}>
            {formatCurrency(transaction.amount, currency, { showSign: isIncome })}
          </AppText>

          <AppText variant="lg" weight="semibold" style={styles.merchantName}>
            {transaction.merchant}
          </AppText>

          <Badge
            label={isIncome ? 'Income' : 'Expense'}
            variant={isIncome ? 'positive' : 'negative'}
            style={{ marginTop: SPACING.xs }}
          />
        </View>

        {/* Detailed Fields List */}
        <View
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={styles.detailRow}>
            <AppText variant="sm" color="secondary">
              Category
            </AppText>
            <View style={styles.categoryValue}>
              <View
                style={[
                  styles.miniDot,
                  { backgroundColor: transaction.categoryColor },
                ]}
              />
              <AppText variant="sm" weight="semibold">
                {transaction.categoryName}
              </AppText>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.detailRow}>
            <AppText variant="sm" color="secondary">
              Transaction Date
            </AppText>
            <AppText variant="sm" weight="semibold">
              {formatDate(transaction.date)}
            </AppText>
          </View>

          {transaction.description ? (
            <>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <View style={styles.detailRow}>
                <AppText variant="sm" color="secondary">
                  Notes / Description
                </AppText>
                <AppText variant="sm" weight="medium" style={{ flex: 1, textAlign: 'right' }}>
                  {transaction.description}
                </AppText>
              </View>
            </>
          ) : null}

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.detailRow}>
            <AppText variant="xs" color="muted">
              Created Timestamp
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
            size="lg"
            icon="edit-3"
            fullWidth
            style={{ marginBottom: SPACING.sm }}
          />

          <AppButton
            title="Delete Transaction"
            onPress={() => setShowDeleteConfirm(true)}
            variant="danger"
            size="lg"
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
  card: {
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  categoryIconBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  merchantName: {
    marginTop: SPACING.xs,
  },
  detailRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xs,
  },
  categoryValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  miniDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  divider: {
    width: '100%',
    height: 1,
    marginVertical: SPACING.xs + 2,
  },
  actionsContainer: {
    marginTop: SPACING.sm,
    marginBottom: SPACING.xl,
  },
});
