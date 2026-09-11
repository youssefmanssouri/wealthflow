import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useFinancial } from '../context/FinancialContext';
import { EXPENSE_CATEGORIES, getCategoryById } from '../constants/categories';
import { CURRENCY_SYMBOLS } from '../utils/currency';
import { SPACING, RADIUS } from '../constants/theme';
import { AppText } from '../components/ui/AppText';
import { AppInput } from '../components/ui/AppInput';
import { AppButton } from '../components/ui/AppButton';
import { Header } from '../components/ui/Header';
import { Icon } from '../components/ui/Icon';
import { Category } from '../types/financial';

export const EditBudgetModal: React.FC<{ route: any; navigation: any }> = ({
  route,
  navigation,
}) => {
  const { categoryId: paramCatId } = route.params || {};
  const { colors, isDark } = useTheme();
  const { budgets, saveBudget, user } = useFinancial();
  const currency = user.preferences.currency;
  const symbol = CURRENCY_SYMBOLS[currency] || '$';

  const defaultCategory = paramCatId
    ? getCategoryById(paramCatId)
    : EXPENSE_CATEGORIES[0];
  const existingBudget = budgets.find((b) => b.categoryId === defaultCategory.id);

  const [selectedCategory, setSelectedCategory] = useState<Category>(defaultCategory);
  const [limit, setLimit] = useState<string>(existingBudget ? String(existingBudget.limit) : '');
  const [error, setError] = useState<string>('');

  const handleCategorySelect = (cat: Category) => {
    setSelectedCategory(cat);
    const found = budgets.find((b) => b.categoryId === cat.id);
    setLimit(found ? String(found.limit) : '');
    setError('');
  };

  const handleSave = async () => {
    const parsedLimit = parseFloat(limit);
    if (!limit || isNaN(parsedLimit) || parsedLimit < 0) {
      setError('Please enter a valid monthly budget limit');
      return;
    }

    await saveBudget(selectedCategory.id, selectedCategory.name, parsedLimit);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <Header
        title="Manage Budget Limit"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Category Picker */}
        <AppText variant="sm" weight="semibold" style={{ marginBottom: SPACING.sm }}>
          Select Category to Set Limit
        </AppText>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {EXPENSE_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory.id === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                activeOpacity={0.7}
                onPress={() => handleCategorySelect(cat)}
                style={[
                  styles.categoryPill,
                  {
                    backgroundColor: isSelected ? cat.color + '20' : colors.card,
                    borderColor: isSelected ? cat.color : colors.border,
                  },
                ]}
              >
                <Icon name={cat.icon} size={16} color={cat.color} />
                <AppText
                  variant="xs"
                  weight={isSelected ? 'bold' : 'medium'}
                  style={{ color: isSelected ? cat.color : colors.textPrimary }}
                >
                  {cat.name}
                </AppText>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Limit Input */}
        <View
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <AppText variant="xs" color="secondary" weight="medium">
            MONTHLY BUDGET LIMIT FOR {selectedCategory.name.toUpperCase()}
          </AppText>

          <View style={styles.inputRow}>
            <AppText variant="giant" weight="bold" color="brand">
              {symbol}
            </AppText>
            <AppInput
              value={limit}
              onChangeText={setLimit}
              keyboardType="decimal-pad"
              placeholder="500.00"
              style={styles.limitInputText}
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
          title="Save Budget Limit"
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
  categoryScroll: {
    gap: SPACING.xs,
    marginBottom: SPACING.lg,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    borderWidth: 1.5,
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
  limitInputText: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    borderWidth: 0,
    backgroundColor: 'transparent',
    height: 48,
  },
});
