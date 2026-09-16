import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { G, Path, Circle } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { CategorySpending } from '../../types/financial';
import { formatCurrency } from '../../utils/currency';
import { getCategoryDonutChartSummary } from '../../utils/chartAccessibility';
import { useFinancial } from '../../context/FinancialContext';
import { SPACING, RADIUS } from '../../constants/theme';
import { AppText } from '../ui/AppText';
import { Icon } from '../ui/Icon';

export interface CategoryDonutChartProps {
  data: CategorySpending[];
  size?: number;
  strokeWidth?: number;
}

export const CategoryDonutChart: React.FC<CategoryDonutChartProps> = ({
  data,
  size = 200,
  strokeWidth = 24,
}) => {
  const { colors } = useTheme();
  const { user, monthlyExpenses } = useFinancial();
  const currency = user.preferences.currency;

  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Filter non-zero spending items
  const validData = data.filter((d) => d.amount > 0);
  const totalAmount = validData.reduce((sum, d) => sum + d.amount, 0);
  const accessibleSummary = getCategoryDonutChartSummary(data, currency);

  // Compute SVG polar arc paths
  let cumulativeAngle = -90; // Start at 12 o'clock

  const slices = validData.map((item) => {
    const percentage = totalAmount > 0 ? item.amount / totalAmount : 0;
    const angle = percentage * 360;

    const startAngle = cumulativeAngle;
    const endAngle = cumulativeAngle + angle;
    cumulativeAngle += angle;

    const x1 = center + radius * Math.cos((Math.PI * startAngle) / 180);
    const y1 = center + radius * Math.sin((Math.PI * startAngle) / 180);
    const x2 = center + radius * Math.cos((Math.PI * endAngle) / 180);
    const y2 = center + radius * Math.sin((Math.PI * endAngle) / 180);

    const largeArcFlag = angle > 180 ? 1 : 0;

    const pathData = [
      `M ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
    ].join(' ');

    return {
      ...item,
      pathData,
      color: item.categoryColor,
    };
  });

  if (validData.length === 0) {
    return (
      <View
        style={styles.emptyChartContainer}
        accessible={true}
        accessibilityRole="image"
        accessibilityLabel="Category spending breakdown: No expenses recorded."
      >
        <Svg width={size} height={size}>
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={colors.border}
            strokeWidth={strokeWidth}
            fill="none"
          />
        </Svg>
        <View style={styles.centerText}>
          <AppText variant="xs" color="muted">
            No Expenses
          </AppText>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View
        style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}
        accessible={true}
        accessibilityRole="image"
        accessibilityLabel={accessibleSummary}
      >
        <Svg width={size} height={size}>
          <G>
            {slices.map((slice) => (
              <Path
                key={slice.categoryId}
                d={slice.pathData}
                stroke={slice.color}
                strokeWidth={strokeWidth}
                fill="none"
                strokeLinecap="round"
              />
            ))}
          </G>
        </Svg>

        <View style={styles.centerText}>
          <AppText variant="xs" color="secondary" weight="medium">
            Total Spent
          </AppText>
          <AppText variant="md" weight="bold">
            {formatCurrency(totalAmount, currency, { compact: true })}
          </AppText>
        </View>
      </View>

      {/* Legend list */}
      <View style={styles.legendContainer}>
        {validData.map((item) => (
          <View key={item.categoryId} style={styles.legendRow}>
            <View style={styles.legendLeft}>
              <View style={[styles.colorDot, { backgroundColor: item.categoryColor }]} />
              <Icon name={item.categoryIcon} size={16} color={colors.textSecondary} />
              <AppText variant="sm" weight="medium">
                {item.categoryName}
              </AppText>
            </View>
            <View style={styles.legendRight}>
              <AppText variant="sm" weight="bold">
                {formatCurrency(item.amount, currency)}
              </AppText>
              <AppText variant="xs" color="secondary" style={{ minWidth: 32, textAlign: 'right' }}>
                {item.percentage}%
              </AppText>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  emptyChartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
  },
  centerText: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  legendContainer: {
    width: '100%',
    marginTop: SPACING.lg,
    gap: SPACING.sm,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xs,
  },
  legendLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
});
