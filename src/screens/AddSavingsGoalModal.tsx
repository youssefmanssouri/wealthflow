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
import { isValidDateString } from '../utils/date';
import { SPACING, RADIUS } from '../constants/theme';
import { AppText } from '../components/ui/AppText';
import { AppInput } from '../components/ui/AppInput';
import { AppButton } from '../components/ui/AppButton';
import { Header } from '../components/ui/Header';
import { Icon } from '../components/ui/Icon';

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

  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState<string>('');
  const [errors, setErrors] = useState<{ name?: string; amount?: string; date?: string }>({});

  const handleSave = async () => {
    if (saving) return;
    setServerError('');
    const errs: { name?: string; amount?: string; date?: string } = {};
    const parsedTarget = parseFloat(targetAmount);

    if (!name.trim()) errs.name = 'Please enter a goal name';
    if (!targetAmount || isNaN(parsedTarget) || parsedTarget <= 0) {
      errs.amount = 'Please enter a valid target amount';
    }
    if (!targetDate.trim()) {
      errs.date = 'Please enter a target date (YYYY-MM-DD)';
    } else if (!isValidDateString(targetDate.trim())) {
      errs.date = 'Please enter a valid calendar date in YYYY-MM-DD format';
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSaving(true);
    try {
      const res = await addSavingsGoal({
        name: name.trim(),
        targetAmount: parsedTarget,
        targetDate: targetDate.trim(),
        monthlyContribution: Math.round(parsedTarget / 12),
        color: '#10B981',
        icon: 'target',
      });

      if (res.success) {
        navigation.goBack();
      } else {
        setServerError(res.error || 'Failed to create savings goal. Please try again.');
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
      <Header title="Create Savings Goal" showBack onBack={() => navigation.goBack()} />

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

        <AppButton
          title="Save Goal"
          onPress={handleSave}
          variant="primary"
          size="lg"
          icon="check"
          loading={saving}
          disabled={saving}
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
