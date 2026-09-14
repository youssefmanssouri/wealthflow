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
import { EXPENSE_CATEGORIES, getCategoryById, resolveCanonicalCategoryId } from '../constants/categories';
import { CURRENCY_SYMBOLS } from '../utils/currency';
import { SPACING, RADIUS } from '../constants/theme';
import { AppText } from '../components/ui/AppText';
import { AppInput } from '../components/ui/AppInput';
import { AppButton } from '../components/ui/AppButton';
import { Header } from '../components/ui/Header';
import { Icon } from '../components/ui/Icon';
import { ConfirmationModal } from '../components/ui/ConfirmationModal';
import { Category } from '../types/financial';

export const EditBudgetModal: React.FC<{ route: any; navigation: any }> = ({
  route,
  navigation,
}) => {
  const { categoryId: paramCatId } = route.params || {};
  const { colors, isDark } = useTheme();
  const { budgets, saveBudget, deleteBudget, user } = useFinancial();
  const currency = user.preferences.currency;
  const symbol = CURRENCY_SYMBOLS[currency] || '$';

  const defaultCategory = paramCatId
    ? getCategoryById(paramCatId)
    : EXPENSE_CATEGORIES[0];
  const initialBudget = budgets.find(
    (b) => resolveCanonicalCategoryId(b.categoryId) === resolveCanonicalCategoryId(defaultCategory.id)
  );

  const [selectedCategory, setSelectedCategory] = useState<Category>(defaultCategory);
  const [limit, setLimit] = useState<string>(initialBudget ? String(initialBudget.limit) : '');
  const [error, setError] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [serverError, setServerError] = useState<string>('');

  const existingBudget = budgets.find(
    (b) => resolveCanonicalCategoryId(b.categoryId) === resolveCanonicalCategoryId(selectedCategory.id)
  );

  const handleCategorySelect = (cat: Category) => {
    setSelectedCategory(cat);
    const found = budgets.find(
      (b) => resolveCanonicalCategoryId(b.categoryId) === resolveCanonicalCategoryId(cat.id)
    );
    setLimit(found ? String(found.limit) : '');
    setError('');
    setServerError('');
  };

  const handleSave = async () => {
    if (saving || deleting) return;
    setError('');
    setServerError('');

    const parsedLimit = parseFloat(limit);
    if (!limit || isNaN(parsedLimit) || parsedLimit < 0) {
      setError('Please enter a valid monthly budget limit');
      return;
    }

    setSaving(true);
    try {
      const res = await saveBudget(selectedCategory.id, selectedCategory.name, parsedLimit);
      if (res.success) {
        navigation.goBack();
      } else {
        setServerError(res.error || 'Failed to save budget limit. Please try again.');
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
      const res = await deleteBudget(selectedCategory.id);
      if (res.success) {
        navigation.goBack();
      } else {
        setServerError(res.error || 'Failed to delete budget limit. Please try again.');
      }
    } catch (err: any) {
      setServerError(err?.message || 'An unexpected network error occurred. Please try again.');
    } finally {
      setDeleting(false);
    }
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

        <View style={styles.actionsContainer}>
          <AppButton
            title="Save Budget Limit"
            onPress={handleSave}
            variant="primary"
            size="lg"
            icon="check"
            loading={saving}
            disabled={saving || deleting}
            fullWidth
            style={{ marginBottom: existingBudget ? SPACING.md : 0 }}
          />

          {existingBudget && (
            <AppButton
              title="Delete Budget"
              onPress={() => setShowDeleteConfirm(true)}
              variant="danger"
              size="lg"
              icon="trash-2"
              loading={deleting}
              disabled={saving || deleting}
              fullWidth
            />
          )}
        </View>
      </ScrollView>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        visible={showDeleteConfirm}
        title="Delete Budget Limit?"
        message={`Are you sure you want to delete the monthly budget limit for ${selectedCategory.name}? Your transaction history for this category will remain untouched.`}
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
