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
    const parsedAmount = parseFloat(amount);
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid contribution amount');
      return;
    }

    await updateSavingsProgress(goal.id, parsedAmount);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <Header title={`Add to ${goal.name}`} showBack onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
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
              onChangeText={setAmount}
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
});
