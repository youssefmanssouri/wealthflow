import React, { useState, useMemo } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useFinancial } from '../context/FinancialContext';
import { ALL_CATEGORIES } from '../constants/categories';
import { formatDate, formatRelativeDate } from '../utils/date';
import { SPACING, RADIUS } from '../constants/theme';
import { AppText } from '../components/ui/AppText';
import { AppInput } from '../components/ui/AppInput';
import { SegmentedControl } from '../components/ui/SegmentedControl';
import { TransactionRow } from '../components/financial/TransactionRow';
import { EmptyState } from '../components/ui/EmptyState';
import { Header } from '../components/ui/Header';
import { Icon } from '../components/ui/Icon';
import { Transaction, TransactionType } from '../types/financial';

type FilterType = 'all' | 'income' | 'expense';

export const TransactionsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const { transactions, isRefreshing, loadError, refreshFinancialData } = useFinancial();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');

  // Filtered transactions computation
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // 1. Type filter
      if (filterType === 'income' && tx.type !== 'income') return false;
      if (filterType === 'expense' && tx.type !== 'expense') return false;

      // 2. Category filter
      if (selectedCategoryId !== 'all' && tx.categoryId !== selectedCategoryId) return false;

      // 3. Search query
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase();
        const matchesMerchant = tx.merchant.toLowerCase().includes(q);
        const matchesCategory = tx.categoryName.toLowerCase().includes(q);
        const matchesDesc = tx.description?.toLowerCase().includes(q) || false;
        return matchesMerchant || matchesCategory || matchesDesc;
      }

      return true;
    });
  }, [transactions, filterType, selectedCategoryId, searchQuery]);

  // Group filtered transactions by date
  const groupedTransactions = useMemo(() => {
    const map: Record<string, Transaction[]> = {};
    filteredTransactions.forEach((tx) => {
      const dateKey = tx.date;
      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push(tx);
    });

    return Object.keys(map)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
      .map((dateKey) => ({
        dateKey,
        dateLabel: formatRelativeDate(dateKey),
        items: map[dateKey],
      }));
  }, [filteredTransactions]);

  const categoriesForType = useMemo(() => {
    if (filterType === 'income') return ALL_CATEGORIES.filter((c) => c.type === 'income');
    if (filterType === 'expense') return ALL_CATEGORIES.filter((c) => c.type === 'expense');
    return ALL_CATEGORIES;
  }, [filterType]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <Header
        title="Transactions"
        subtitle={`${filteredTransactions.length} records`}
        rightActionIcon="plus"
        onRightAction={() => navigation.navigate('AddTransaction')}
      />

      <View style={styles.filterSection}>
        {/* Search Input */}
        <AppInput
          placeholder="Search merchant, category or note..."
          icon="search"
          value={searchQuery}
          onChangeText={setSearchQuery}
          containerStyle={{ marginBottom: SPACING.sm }}
        />

        {/* Type Toggle Tabs */}
        <SegmentedControl
          options={[
            { label: 'All', value: 'all' },
            { label: 'Income', value: 'income' },
            { label: 'Expenses', value: 'expense' },
          ]}
          selectedValue={filterType}
          onSelect={(val) => {
            setFilterType(val);
            setSelectedCategoryId('all');
          }}
          style={{ marginBottom: SPACING.sm }}
        />

        {/* Horizontal Category Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryPillsScroll}
        >
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setSelectedCategoryId('all')}
            style={[
              styles.pill,
              {
                backgroundColor:
                  selectedCategoryId === 'all' ? colors.primary : colors.inputBg,
              },
            ]}
          >
            <AppText
              variant="xs"
              weight="semibold"
              style={{
                color: selectedCategoryId === 'all' ? '#FFFFFF' : colors.textSecondary,
              }}
            >
              All Categories
            </AppText>
          </TouchableOpacity>

          {categoriesForType.map((cat) => {
            const isSelected = selectedCategoryId === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                activeOpacity={0.7}
                onPress={() => setSelectedCategoryId(cat.id)}
                style={[
                  styles.pill,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.inputBg,
                  },
                ]}
              >
                <AppText
                  variant="xs"
                  weight="semibold"
                  style={{
                    color: isSelected ? '#FFFFFF' : colors.textSecondary,
                  }}
                >
                  {cat.name}
                </AppText>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Transaction List */}
      <ScrollView
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refreshFinancialData}
            tintColor={colors.primary}
          />
        }
      >
        {groupedTransactions.length > 0 ? (
          <>
            {loadError && (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={refreshFinancialData}
                style={[
                  styles.errorBanner,
                  { backgroundColor: colors.negative + '18', borderColor: colors.negative + '40' },
                ]}
              >
                <Icon name="AlertCircle" size={18} color={colors.negative} />
                <AppText
                  variant="xs"
                  weight="medium"
                  style={{ flex: 1, color: colors.negative, marginLeft: 8 }}
                >
                  {loadError} Tap to retry.
                </AppText>
                <Icon name="RefreshCw" size={14} color={colors.negative} />
              </TouchableOpacity>
            )}
            {groupedTransactions.map((group) => (
              <View key={group.dateKey} style={styles.groupContainer}>
                <View style={styles.dateHeader}>
                  <AppText variant="sm" weight="bold" color="secondary">
                    {group.dateLabel}
                  </AppText>
                  <AppText variant="xs" color="muted">
                    {formatDate(group.dateKey)}
                  </AppText>
                </View>

                {group.items.map((tx) => (
                  <TransactionRow
                    key={tx.id}
                    transaction={tx}
                    onPress={() =>
                      navigation.navigate('TransactionDetail', { transactionId: tx.id })
                    }
                  />
                ))}
              </View>
            ))}
          </>
        ) : loadError ? (
          <EmptyState
            icon="AlertCircle"
            title="Unable to Load Transactions"
            description={loadError}
            actionLabel="Try Again"
            onAction={refreshFinancialData}
          />
        ) : (
          <EmptyState
            icon="search-x"
            title="No Transactions Found"
            description={
              searchQuery.length > 0 || selectedCategoryId !== 'all' || filterType !== 'all'
                ? "No items match your active filters or search keyword."
                : "You haven't recorded any transactions yet."
            }
            actionLabel="Clear Filters / Add"
            onAction={() => {
              setSearchQuery('');
              setFilterType('all');
              setSelectedCategoryId('all');
            }}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    marginBottom: SPACING.md,
  },
  filterSection: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.xs,
  },
  categoryPillsScroll: {
    gap: SPACING.xs,
    paddingVertical: SPACING.xs,
  },
  pill: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.full,
  },
  listContent: {
    padding: SPACING.md,
  },
  groupContainer: {
    marginBottom: SPACING.md,
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
    paddingHorizontal: 4,
  },
});
