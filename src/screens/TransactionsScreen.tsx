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
import { Transaction } from '../types/financial';

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
    ({
      item,
      index,
      section,
    }: {
      item: Transaction;
      index: number;
      section: TransactionSection;
    }) => {
      const isFirst = index === 0;
      const isLast = index === section.data.length - 1;

      return (
        <TransactionRow
          transaction={item}
          currency={currency}
          variant="flat"
          hideBorder={isLast}
          onPress={handlePressTransaction}
          style={[
            styles.groupedRow,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderTopLeftRadius: isFirst ? RADIUS.md : 0,
              borderTopRightRadius: isFirst ? RADIUS.md : 0,
              borderBottomLeftRadius: isLast ? RADIUS.md : 0,
              borderBottomRightRadius: isLast ? RADIUS.md : 0,
              borderTopWidth: isFirst ? 1 : 0,
              borderBottomWidth: isLast ? 1 : 1,
              borderLeftWidth: 1,
              borderRightWidth: 1,
            },
          ]}
        />
      );
    },
    [currency, handlePressTransaction, colors]
  );

  const renderSectionHeader = useCallback(
    ({ section }: { section: TransactionSection }) => (
      <View style={styles.dateHeader}>
        <AppText variant="xs" weight="semibold" color="secondary" style={styles.dateLabel}>
          {section.dateLabel.toUpperCase()}
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
          { backgroundColor: colors.negativeBg, borderColor: colors.negative + '30' },
        ]}
      >
        <Icon name="AlertCircle" size={16} color={colors.negative} />
        <AppText
          variant="xs"
          weight="medium"
          style={{ flex: 1, color: colors.negative, marginLeft: 8 }}
        >
          {loadError} Tap to retry.
        </AppText>
        <Icon name="RefreshCw" size={13} color={colors.negative} />
      </TouchableOpacity>
    );
  }, [loadError, groupedTransactions.length, colors, refreshFinancialData]);

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

    const hasActiveFilters =
      searchQuery.length > 0 || selectedCategoryId !== 'all' || filterType !== 'all';

    if (hasActiveFilters) {
      return (
        <EmptyState
          icon="search-x"
          title="No Transactions Found"
          description="No transactions match your active search keyword or category filters."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearchQuery('');
            setFilterType('all');
            setSelectedCategoryId('all');
          }}
        />
      );
    }

    return (
      <EmptyState
        icon="receipt"
        title="No Transactions Yet"
        description="Start building your cash flow history by recording your first income or expense."
        actionLabel="Add Transaction"
        onAction={() => navigation.navigate('AddTransaction')}
      />
    );
  }, [loadError, searchQuery, selectedCategoryId, filterType, refreshFinancialData, navigation]);

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
          containerStyle={{ marginBottom: SPACING.xs + 2 }}
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
          style={{ marginBottom: SPACING.xs + 2 }}
        />

        {/* Horizontal Category Tags */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryTagsScroll}
        >
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setSelectedCategoryId('all')}
            style={[
              styles.tagBtn,
              {
                backgroundColor:
                  selectedCategoryId === 'all'
                    ? isDark
                      ? colors.surface
                      : colors.card
                    : 'transparent',
                borderColor: selectedCategoryId === 'all' ? colors.primary : colors.border,
              },
            ]}
          >
            <AppText
              variant="xs"
              weight="medium"
              style={{
                color: selectedCategoryId === 'all' ? colors.primary : colors.textSecondary,
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
                  styles.tagBtn,
                  {
                    backgroundColor: isSelected
                      ? isDark
                        ? colors.surface
                        : colors.card
                      : 'transparent',
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
              >
                <AppText
                  variant="xs"
                  weight="medium"
                  style={{
                    color: isSelected ? colors.primary : colors.textSecondary,
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
  categoryTagsScroll: {
    gap: 6,
    paddingVertical: SPACING.xs,
  },
  tagBtn: {
    paddingHorizontal: SPACING.sm + 4,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
  },
  listContent: {
    padding: SPACING.md,
    paddingTop: SPACING.xs,
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
    paddingHorizontal: 2,
  },
  dateLabel: {
    letterSpacing: 0.6,
  },
  groupedRow: {
    overflow: 'hidden',
  },
});
