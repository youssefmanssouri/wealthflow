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
import { CURRENCY_SYMBOLS } from '../utils/currency';
import { SPACING, RADIUS } from '../constants/theme';
import { AppText } from '../components/ui/AppText';
import { AppInput } from '../components/ui/AppInput';
import { AppButton } from '../components/ui/AppButton';
import { Header } from '../components/ui/Header';

export const AddSavingsGoalModal: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const { addSavingsGoal, user } = useFinancial();
  const currency = user.preferences.currency;
  const symbol = CURRENCY_SYMBOLS[currency] || '$';

  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [targetDate, setTargetDate] = useState(
    new Date(new Date().setFullYear(new Date().getFullYear() + 1))
      .toISOString()
      .substring(0, 10)
  );

  const [errors, setErrors] = useState<{ name?: string; amount?: string }>({});

  const handleSave = async () => {
    const errs: { name?: string; amount?: string } = {};
    const parsedTarget = parseFloat(targetAmount);

    if (!name.trim()) errs.name = 'Please enter a goal name';
    if (!targetAmount || isNaN(parsedTarget) || parsedTarget <= 0) {
      errs.amount = 'Please enter a valid target amount';
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    await addSavingsGoal({
      name: name.trim(),
      targetAmount: parsedTarget,
      targetDate,
      monthlyContribution: Math.round(parsedTarget / 12),
      color: '#10B981',
      icon: 'target',
    });

    navigation.goBack();
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <Header title="Create Savings Goal" showBack onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <AppInput
          label="Goal Name *"
          placeholder="e.g. Emergency Fund, House Downpayment"
          icon="shield"
          value={name}
          onChangeText={setName}
          error={errors.name}
        />

        <AppInput
          label={`Target Amount (${symbol}) *`}
          placeholder="5000.00"
          icon="dollar-sign"
          keyboardType="decimal-pad"
          value={targetAmount}
          onChangeText={setTargetAmount}
          error={errors.amount}
        />

        <AppInput
          label="Target Date (YYYY-MM-DD) *"
          placeholder="YYYY-MM-DD"
          icon="calendar"
          value={targetDate}
          onChangeText={setTargetDate}
        />

        <AppButton
          title="Save Goal"
          onPress={handleSave}
          variant="primary"
          size="lg"
          icon="check"
          fullWidth
          style={{ marginTop: SPACING.md }}
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
});
