import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useFinancial } from '../context/FinancialContext';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../constants/categories';
import { CURRENCY_SYMBOLS } from '../utils/currency';
import { SPACING, RADIUS } from '../constants/theme';
import { AppText } from '../components/ui/AppText';
import { AppInput } from '../components/ui/AppInput';
import { AppButton } from '../components/ui/AppButton';
import { SegmentedControl } from '../components/ui/SegmentedControl';
import { Header } from '../components/ui/Header';
import { Icon } from '../components/ui/Icon';
import { TransactionType, Category } from '../types/financial';
import { isValidDateString, getLocalDateString } from '../utils/date';

export const AddTransactionModal: React.FC<{ route: any; navigation: any }> = ({
  route,
  navigation,
}) => {
  const { editTransactionId } = route.params || {};
  const { colors, isDark } = useTheme();
  const { transactions, addTransaction, editTransaction, user } = useFinancial();
  const currency = user.preferences.currency;
  const currencySymbol = CURRENCY_SYMBOLS[currency] || '$';

  const existingTx = editTransactionId
    ? transactions.find((t) => t.id === editTransactionId)
    : null;

  const [type, setType] = useState<TransactionType>(existingTx ? existingTx.type : 'expense');
  const [amount, setAmount] = useState<string>(existingTx ? String(existingTx.amount) : '');
  const [merchant, setMerchant] = useState<string>(existingTx ? existingTx.merchant : '');
  const [selectedCategory, setSelectedCategory] = useState<Category>(
    existingTx
      ? {
          id: existingTx.categoryId,
          name: existingTx.categoryName,
          type: existingTx.type,
          icon: existingTx.categoryIcon,
          color: existingTx.categoryColor,
        }
      : EXPENSE_CATEGORIES[0]
  );
  const [date, setDate] = useState<string>(
    existingTx ? existingTx.date : getLocalDateString()
  );
  const [description, setDescription] = useState<string>(existingTx?.description || '');

  const todayStr = getLocalDateString();
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = getLocalDateString(yesterdayDate);

  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState<string>('');
  const [errors, setErrors] = useState<{ amount?: string; merchant?: string; date?: string }>({});

  const availableCategories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  // When type changes, switch default category if current category belongs to other type
  useEffect(() => {
    if (selectedCategory.type !== type) {
      setSelectedCategory(availableCategories[0]);
    }
  }, [type]);

  const validate = () => {
    const errs: { amount?: string; merchant?: string; date?: string } = {};
    const parsedAmount = parseFloat(amount);
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      errs.amount = 'Please enter a valid amount greater than 0';
    }
    if (!merchant.trim()) {
      errs.merchant = 'Please enter a merchant or payer name';
    }
    if (!date.trim()) {
      errs.date = 'Please enter a transaction date (YYYY-MM-DD)';
    } else if (!isValidDateString(date.trim())) {
      errs.date = 'Please enter a valid calendar date in YYYY-MM-DD format';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (saving) return;
    setServerError('');
    if (!validate()) return;

    setSaving(true);
    try {
      const parsedAmount = parseFloat(amount);
      const trimmedDate = date.trim();
      let res: { success: boolean; error?: string };

      if (existingTx) {
        res = await editTransaction(existingTx.id, {
          type,
          amount: parsedAmount,
          categoryId: selectedCategory.id,
          categoryName: selectedCategory.name,
          categoryIcon: selectedCategory.icon,
          categoryColor: selectedCategory.color,
          merchant: merchant.trim(),
          date: trimmedDate,
          description: description.trim(),
        });
      } else {
        res = await addTransaction({
          type,
          amount: parsedAmount,
          categoryId: selectedCategory.id,
          categoryName: selectedCategory.name,
          categoryIcon: selectedCategory.icon,
          categoryColor: selectedCategory.color,
          merchant: merchant.trim(),
          date: trimmedDate,
          description: description.trim(),
        });
      }

      if (res.success) {
        navigation.goBack();
      } else {
        setServerError(res.error || 'Failed to save transaction. Please check details and try again.');
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
      <Header
        title={existingTx ? 'Edit Transaction' : 'Add Transaction'}
        showBack
        onBack={() => navigation.goBack()}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
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

          {/* Income / Expense Type Switcher */}
          <SegmentedControl
            options={[
              { label: 'Expense', value: 'expense' },
              { label: 'Income', value: 'income' },
            ]}
            selectedValue={type}
            onSelect={(val) => setType(val as TransactionType)}
            style={{ marginBottom: SPACING.lg }}
          />

          {/* Prominent Amount Display Input */}
          <View
            style={[
              styles.amountCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <AppText variant="xs" color="secondary" weight="medium">
              ENTER AMOUNT ({currency})
            </AppText>
            <View style={styles.amountInputRow}>
              <AppText
                variant="giant"
                weight="bold"
                color={type === 'income' ? 'positive' : 'primary'}
              >
                {currencySymbol}
              </AppText>
              <AppInput
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                placeholder="0.00"
                style={styles.amountInputText}
                containerStyle={{ flex: 1, marginBottom: 0 }}
              />
            </View>
            {errors.amount && (
              <AppText variant="xs" color="negative" style={{ marginTop: 4 }}>
                {errors.amount}
              </AppText>
            )}
          </View>

          {/* Category Selection Grid */}
          <View style={styles.fieldSection}>
            <AppText variant="sm" weight="semibold" style={{ marginBottom: SPACING.sm }}>
              Category
            </AppText>

            <View style={styles.categoryGrid}>
              {availableCategories.map((cat) => {
                const isSelected = selectedCategory.id === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    activeOpacity={0.7}
                    onPress={() => setSelectedCategory(cat)}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel={cat.name}
                    accessibilityState={{ selected: isSelected }}
                    style={[
                      styles.categoryItem,
                      {
                        backgroundColor: isSelected
                          ? cat.color + '25'
                          : colors.card,
                        borderColor: isSelected ? cat.color : colors.border,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.catIconCircle,
                        { backgroundColor: cat.color + '20' },
                      ]}
                    >
                      <Icon name={cat.icon} size={20} color={cat.color} />
                    </View>
                    <AppText
                      variant="xs"
                      weight={isSelected ? 'bold' : 'medium'}
                      numberOfLines={1}
                      align="center"
                    >
                      {cat.name}
                    </AppText>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Additional Details */}
          <View style={styles.fieldSection}>
            <AppInput
              label="Merchant / Payer Name *"
              placeholder="e.g. Starbucks, Salary, Uber"
              icon="building-2"
              value={merchant}
              onChangeText={setMerchant}
              error={errors.merchant}
            />

            <View style={styles.dateHeaderRow}>
              <AppText variant="sm" weight="medium" color="secondary">
                Date (YYYY-MM-DD) *
              </AppText>
              <View style={styles.quickDateContainer}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    setDate(todayStr);
                    if (errors.date) setErrors((prev) => ({ ...prev, date: undefined }));
                  }}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Set date to Today"
                  accessibilityState={{ selected: date === todayStr }}
                  style={[
                    styles.quickDateChip,
                    {
                      backgroundColor: date === todayStr ? colors.primary + '20' : colors.card,
                      borderColor: date === todayStr ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <AppText
                    variant="xs"
                    weight={date === todayStr ? 'bold' : 'medium'}
                    color={date === todayStr ? 'primary' : 'secondary'}
                  >
                    Today
                  </AppText>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    setDate(yesterdayStr);
                    if (errors.date) setErrors((prev) => ({ ...prev, date: undefined }));
                  }}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Set date to Yesterday"
                  accessibilityState={{ selected: date === yesterdayStr }}
                  style={[
                    styles.quickDateChip,
                    {
                      backgroundColor: date === yesterdayStr ? colors.primary + '20' : colors.card,
                      borderColor: date === yesterdayStr ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <AppText
                    variant="xs"
                    weight={date === yesterdayStr ? 'bold' : 'medium'}
                    color={date === yesterdayStr ? 'primary' : 'secondary'}
                  >
                    Yesterday
                  </AppText>
                </TouchableOpacity>
              </View>
            </View>

            <AppInput
              placeholder="YYYY-MM-DD"
              icon="calendar"
              value={date}
              onChangeText={(text) => {
                setDate(text);
                if (errors.date) setErrors((prev) => ({ ...prev, date: undefined }));
              }}
              error={errors.date}
            />

            <AppInput
              label="Description / Note (Optional)"
              placeholder="Add extra context or notes..."
              icon="file-text"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={2}
            />
          </View>

          {/* Save Button */}
          <View style={styles.saveBtnContainer}>
            <AppButton
              title={existingTx ? 'Save Changes' : 'Save Transaction'}
              onPress={handleSave}
              variant="primary"
              size="lg"
              icon="check"
              loading={saving}
              disabled={saving}
              fullWidth
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  amountCard: {
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  amountInputRow: {
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
  fieldSection: {
    marginBottom: SPACING.md,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  categoryItem: {
    width: '31%',
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    gap: SPACING.xs,
  },
  catIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnContainer: {
    marginTop: SPACING.md,
    marginBottom: SPACING.xxl,
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
  dateHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  quickDateContainer: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  quickDateChip: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
});
