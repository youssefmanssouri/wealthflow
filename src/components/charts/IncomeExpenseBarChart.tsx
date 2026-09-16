import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { useFinancial } from '../../context/FinancialContext';
import { MonthlyTrend } from '../../types/financial';
import { formatCurrency } from '../../utils/currency';
import { getIncomeExpenseChartSummary } from '../../utils/chartAccessibility';
import { SPACING, RADIUS } from '../../constants/theme';
import { AppText } from '../ui/AppText';

export interface IncomeExpenseBarChartProps {
  data: MonthlyTrend[];
  height?: number;
}

export const IncomeExpenseBarChart: React.FC<IncomeExpenseBarChartProps> = ({
  data,
  height = 180,
}) => {
  const { colors } = useTheme();
  const { user } = useFinancial();
  const currency = user.preferences.currency;

  const accessibleSummary = getIncomeExpenseChartSummary(data, currency);

  const maxVal = Math.max(
    ...data.flatMap((d) => [d.income, d.expenses]),
    1000
  );

  const barGroupWidth = 48;
  const barWidth = 14;
  const chartWidth = data.length * barGroupWidth + 20;
  const maxBarHeight = height - 40;

  return (
    <View style={styles.container}>
      <View style={styles.legendHeader}>
        <View style={styles.legendItem}>
          <View style={[styles.legendIndicator, { backgroundColor: colors.positive }]} />
          <AppText variant="xs" color="secondary" weight="medium">
            Income
          </AppText>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendIndicator, { backgroundColor: colors.negative }]} />
          <AppText variant="xs" color="secondary" weight="medium">
            Expenses
          </AppText>
        </View>
      </View>

      <View
        style={styles.chartWrapper}
        accessible={true}
        accessibilityRole="image"
        accessibilityLabel={accessibleSummary}
      >
        <Svg width="100%" height={height} viewBox={`0 0 ${chartWidth} ${height}`}>
          {data.map((item, index) => {
            const xGroup = index * barGroupWidth + 10;

            const incomeHeight = Math.max(4, (item.income / maxVal) * maxBarHeight);
            const expenseHeight = Math.max(4, (item.expenses / maxVal) * maxBarHeight);

            const incomeY = height - 25 - incomeHeight;
            const expenseY = height - 25 - expenseHeight;

            return (
              <React.Fragment key={item.month}>
                {/* Income Bar */}
                <Rect
                  x={xGroup}
                  y={incomeY}
                  width={barWidth}
                  height={incomeHeight}
                  fill={colors.positive}
                  rx={4}
                />
                {/* Expense Bar */}
                <Rect
                  x={xGroup + barWidth + 4}
                  y={expenseY}
                  width={barWidth}
                  height={expenseHeight}
                  fill={colors.negative}
                  rx={4}
                />
                {/* Month Label */}
                <SvgText
                  x={xGroup + barWidth}
                  y={height - 5}
                  fontSize="11"
                  fill={colors.textSecondary}
                  textAnchor="middle"
                  fontWeight="500"
                >
                  {item.month}
                </SvgText>
              </React.Fragment>
            );
          })}
        </Svg>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: SPACING.sm,
  },
  legendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: SPACING.md,
    marginBottom: SPACING.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  legendIndicator: {
    width: 10,
    height: 10,
    borderRadius: 3,
  },
  chartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
