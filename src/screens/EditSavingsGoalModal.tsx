import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useFinancial } from '../context/FinancialContext';
import { CURRENCY_SYMBOLS, formatCurrency } from '../utils/currency';
import { isValidDateString } from '../utils/date';
import { SPACING, RADIUS } from '../constants/theme';
import { AppText } from '../components/ui/AppText';
import { AppInput } from '../components/ui/AppInput';
import { AppButton } from '../components/ui/AppButton';
import { Header } from '../components/ui/Header';
import { Icon } from '../components/ui/Icon';
import { ConfirmationModal } from '../components/ui/ConfirmationModal';

export const EditSavingsGoalModal: React.FC<{ route: any; navigation: any }> = ({
  route,
  navigation,
}) => {
  const { goalId } = route.params || {};
  const { colors, isDark } = useTheme();
  const { savingsGoals, updateSavingsGoal, deleteSavingsGoal, user } = useFinancial();
  const currency = user.preferences.currency;
  const symbol = CURRENCY_SYMBOLS[currency] || '$';

  const goal = savingsGoals.find((g) => g.id === goalId);

  const [name, setName] = useState(goal ? goal.name : '');
  const [targetAmount, setTargetAmount] = useState(goal ? String(goal.targetAmount) : '');
  const [targetDate, setTargetDate] = useState(
    goal && goal.targetDate ? goal.targetDate.substring(0, 10) : ''
  );

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [serverError, setServerError] = useState<string>('');
  const [errors, setErrors] = useState<{ name?: string; amount?: string; date?: string }>({});

  if (!goal) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <Header title="Edit Savings Goal" showBack onBack={() => navigation.goBack()} />
        <View style={styles.notFoundContainer}>
          <AppText variant="md" color="secondary">
            Savings goal not found or deleted.
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

  const validate = () => {
    const errs: { name?: string; amount?: string; date?: string } = {};
    const parsedTarget = parseFloat(targetAmount);

    if (!name.trim()) errs.name = 'Please enter a goal name';
    if (!targetAmount || isNaN(parsedTarget) || parsedTarget <= 0) {
      errs.amount = 'Please enter a valid target amount greater than 0';
    }
    if (!targetDate.trim()) {
      errs.date = 'Please enter a target date (YYYY-MM-DD)';
    } else if (!isValidDateString(targetDate.trim())) {
      errs.date = 'Please enter a valid calendar date in YYYY-MM-DD format';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (saving || deleting) return;
    setServerError('');
    if (!validate()) return;

    setSaving(true);
    try {
      const parsedTarget = parseFloat(targetAmount);
      const res = await updateSavingsGoal(goal.id, {
        name: name.trim(),
        targetAmount: parsedTarget,
        targetDate: targetDate.trim(),
      });

      if (res.success) {
        navigation.goBack();
      } else {
        setServerError(res.error || 'Failed to update savings goal. Please try again.');
      }
    } catch (err: any) {
      setServerError(err?.message || 'An unexpected network error occurred. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (deleting || saving) return;
    setShowDeleteConfirm(false);
    setDeleting(true);
    setServerError('');

    try {
      const res = await deleteSavingsGoal(goal.id);
      if (res.success) {
        navigation.goBack();
      } else {
        setServerError(res.error || 'Failed to delete savings goal. Please try again.');
      }
    } catch (err: any) {
      setServerError(err?.message || 'An unexpected network error occurred. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const remaining = Math.max(0, (parseFloat(targetAmount) || goal.targetAmount) - goal.currentAmount);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <Header title="Edit Savings Goal" showBack onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {serverError ? (
          <View
            style={[
              styles.errorBox,
              { backgroundColor: colors.negativeBg, borderColor: colors.negative + '40' },
            ]}
          >
            <Icon name="alert-circle" size={18} color={colors.negative} />
            <AppText style={[styles.errorText, { color: colors.negative }]}>
              {serverError}
            </AppText>
          </View>
        ) : null}

        {/* Current Progress Context Card */}
        <View style={[styles.contextCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.contextRow}>
            <View>
              <AppText variant="xs" color="secondary">
                Currently Saved
              </AppText>
              <AppText variant="lg" weight="bold" color="positive">
                {formatCurrency(goal.currentAmount, currency)}
              </AppText>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <AppText variant="xs" color="secondary">
                Remaining to Goal
              </AppText>
              <AppText variant="md" weight="bold" color="brand">
                {formatCurrency(remaining, currency)}
              </AppText>
            </View>
          </View>
        </View>

        <AppInput
          label="Goal Name *"
          placeholder="e.g. Emergency Fund, House Downpayment"
          icon="shield"
          value={name}
          onChangeText={(text) => {
            setName(text);
            if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
          }}
          error={errors.name}
        />

        <AppInput
          label={`Target Amount (${symbol}) *`}
          placeholder="5000.00"
          icon="dollar-sign"
          keyboardType="decimal-pad"
          value={targetAmount}
          onChangeText={(text) => {
            setTargetAmount(text);
            if (errors.amount) setErrors((prev) => ({ ...prev, amount: undefined }));
          }}
          error={errors.amount}
        />

        <AppInput
          label="Target Date (YYYY-MM-DD) *"
          placeholder="YYYY-MM-DD"
          icon="calendar"
          value={targetDate}
          onChangeText={(text) => {
            setTargetDate(text);
            if (errors.date) setErrors((prev) => ({ ...prev, date: undefined }));
          }}
          error={errors.date}
        />

        <View style={styles.actionsContainer}>
          <AppButton
            title="Save Changes"
            onPress={handleSave}
            variant="primary"
            size="lg"
            icon="check"
            loading={saving}
            disabled={saving || deleting}
            fullWidth
            style={{ marginBottom: SPACING.md }}
          />

          <AppButton
            title="Delete Goal"
            onPress={() => setShowDeleteConfirm(true)}
            variant="danger"
            size="lg"
            icon="trash-2"
            loading={deleting}
            disabled={saving || deleting}
            fullWidth
          />
        </View>
      </ScrollView>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        visible={showDeleteConfirm}
        title="Delete Savings Goal?"
        message={`Are you sure you want to delete "${goal.name}" (${formatCurrency(
          goal.currentAmount,
          currency
        )} saved)? All recorded savings contributions for this goal will also be deleted. This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        isDanger
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
  },
  notFoundContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  contextCard: {
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    marginBottom: SPACING.md,
  },
  contextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
  },
  actionsContainer: {
    marginTop: SPACING.sm,
    marginBottom: SPACING.xl,
  },
});
