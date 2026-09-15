import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  RefreshControl,
  SectionList,
  Platform,
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

interface TransactionSection {
  dateKey: string;
  dateLabel: string;
  data: Transaction[];
}

export const TransactionsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const { transactions, isRefreshing, loadError, refreshFinancialData, user } = useFinancial();
  const currency = user.preferences.currency;

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
  const groupedTransactions: TransactionSection[] = useMemo(() => {
    const map: Record<string, Transaction[]> = {};
    filteredTransactions.forEach((tx) => {
      const dateKey = tx.date;
      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push(tx);
    });

    return Object.keys(map)
      .sort((a, b) => b.localeCompare(a))
      .map((dateKey) => ({
        dateKey,
        dateLabel: formatRelativeDate(dateKey),
        data: map[dateKey],
      }));
  }, [filteredTransactions]);

  const categoriesForType = useMemo(() => {
    if (filterType === 'income') return ALL_CATEGORIES.filter((c) => c.type === 'income');
    if (filterType === 'expense') return ALL_CATEGORIES.filter((c) => c.type === 'expense');
    return ALL_CATEGORIES;
  }, [filterType]);

  const handlePressTransaction = useCallback(
    (id: string) => {
      navigation.navigate('TransactionDetail', {
        transactionId: id,
      });
    },
    [navigation]
  );

  const keyExtractor = useCallback((item: Transaction) => item.id, []);

  const renderItem = useCallback(
    ({ item }: { item: Transaction }) => (
      <TransactionRow
        transaction={item}
        currency={currency}
        onPress={handlePressTransaction}
      />
    ),
    [currency, handlePressTransaction]
  );

  const renderSectionHeader = useCallback(
    ({ section }: { section: TransactionSection }) => (
      <View style={styles.dateHeader}>
        <AppText variant="sm" weight="bold" color="secondary">
          {section.dateLabel}
        </AppText>
        <AppText variant="xs" color="muted">
          {formatDate(section.dateKey)}
        </AppText>
      </View>
    ),
    []
  );

  const renderListHeader = useCallback(() => {
    if (!loadError || groupedTransactions.length === 0) return null;
    return (
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
    );
  }, [loadError, groupedTransactions.length, colors.negative, refreshFinancialData]);

  const renderListEmpty = useCallback(() => {
    if (loadError) {
      return (
        <EmptyState
          icon="AlertCircle"
          title="Unable to Load Transactions"
          description={loadError}
          actionLabel="Try Again"
          onAction={refreshFinancialData}
        />
      );
    }

    return (
      <EmptyState
        icon="search-x"
        title="No Transactions Found"
        description={
          searchQuery.length > 0 || selectedCategoryId !== 'all' || filterType !== 'all'
            ? 'No items match your active filters or search keyword.'
            : "You haven't recorded any transactions yet."
        }
        actionLabel="Clear Filters / Add"
        onAction={() => {
          setSearchQuery('');
          setFilterType('all');
          setSelectedCategoryId('all');
        }}
      />
    );
  }, [loadError, searchQuery, selectedCategoryId, filterType, refreshFinancialData]);

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
      <SectionList<Transaction, TransactionSection>
        sections={groupedTransactions}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        ListHeaderComponent={renderListHeader}
        ListEmptyComponent={renderListEmpty}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
        initialNumToRender={15}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={Platform.OS === 'android'}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refreshFinancialData}
            tintColor={colors.primary}
          />
        }
      />
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
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.xs,
    marginBottom: SPACING.xs,
    paddingHorizontal: 4,
  },
});
