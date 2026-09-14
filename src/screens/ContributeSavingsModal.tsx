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
import { SPACING, RADIUS } from '../constants/theme';
import { AppText } from '../components/ui/AppText';
import { AppInput } from '../components/ui/AppInput';
import { AppButton } from '../components/ui/AppButton';
import { Header } from '../components/ui/Header';
import { Icon } from '../components/ui/Icon';

export const ContributeSavingsModal: React.FC<{ route: any; navigation: any }> = ({
  route,
  navigation,
}) => {
  const { goalId } = route.params || {};
  const { colors, isDark } = useTheme();
  const { savingsGoals, updateSavingsProgress, user } = useFinancial();
  const currency = user.preferences.currency;
  const symbol = CURRENCY_SYMBOLS[currency] || '$';

  const goal = savingsGoals.find((g) => g.id === goalId);

  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState('');

  if (!goal) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <Header title="Add Savings" showBack onBack={() => navigation.goBack()} />
        <View style={{ padding: SPACING.lg }}>
          <AppText variant="md" color="secondary">
            Savings goal not found.
          </AppText>
        </View>
      </SafeAreaView>
    );
  }

  const handleSave = async () => {
    if (saving) return;
    setError('');
    setServerError('');

    const parsedAmount = parseFloat(amount);
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid contribution amount greater than 0');
      return;
    }

    setSaving(true);
    try {
      const res = await updateSavingsProgress(goal.id, parsedAmount);
      if (res.success) {
        navigation.goBack();
      } else {
        setServerError(res.error || 'Failed to deposit savings. Please try again.');
      }
    } catch (err: any) {
      setServerError(err?.message || 'An unexpected network error occurred. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <Header title={`Add to ${goal.name}`} showBack onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
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

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <AppText variant="xs" color="secondary">
            Current Savings: {formatCurrency(goal.currentAmount, currency)} /{' '}
            {formatCurrency(goal.targetAmount, currency)}
          </AppText>
          <View style={styles.inputRow}>
            <AppText variant="giant" weight="bold" color="brand">
              {symbol}
            </AppText>
            <AppInput
              value={amount}
              onChangeText={(text) => {
                setAmount(text);
                if (error) setError('');
              }}
              keyboardType="decimal-pad"
              placeholder="100.00"
              style={styles.amountInputText}
              containerStyle={{ flex: 1, marginBottom: 0 }}
            />
          </View>
          {error ? (
            <AppText variant="xs" color="negative" style={{ marginTop: 4 }}>
              {error}
            </AppText>
          ) : null}
        </View>

        <AppButton
          title="Deposit to Goal"
          onPress={handleSave}
          variant="primary"
          size="lg"
          icon="check"
          loading={saving}
          disabled={saving}
          fullWidth
        />
      </ScrollView>
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
  card: {
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.xs,
  },
  amountInputText: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    borderWidth: 0,
    backgroundColor: 'transparent',
    height: 48,
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
});
