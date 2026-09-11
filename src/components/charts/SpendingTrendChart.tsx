import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Text as SvgText, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { useFinancial } from '../../context/FinancialContext';
import { MonthlyTrend } from '../../types/financial';
import { formatCurrency } from '../../utils/currency';
import { SPACING } from '../../constants/theme';
import { AppText } from '../ui/AppText';

export interface SpendingTrendChartProps {
  data: MonthlyTrend[];
  height?: number;
}

export const SpendingTrendChart: React.FC<SpendingTrendChartProps> = ({
  data,
  height = 160,
}) => {
  const { colors, isDark } = useTheme();
  const { user } = useFinancial();
  const currency = user.preferences.currency;

  if (!data || data.length === 0) return null;

  const width = 320;
  const paddingX = 25;
  const paddingY = 25;
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  const maxExpense = Math.max(...data.map((d) => d.expenses), 100);
  const minExpense = Math.min(...data.map((d) => d.expenses), 0);
  const range = maxExpense - minExpense || 1;

  const points = data.map((item, index) => {
    const x = paddingX + (index / (data.length - 1)) * chartWidth;
    const y = height - paddingY - ((item.expenses - minExpense) / range) * chartHeight;
    return { x, y, value: item.expenses, month: item.month };
  });

  // Construct smooth SVG line path
  const linePath = points.reduce((acc, point, index) => {
    return index === 0 ? `M ${point.x} ${point.y}` : `${acc} L ${point.x} ${point.y}`;
  }, '');

  // Closed area path for gradient fill under the line
  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];
  const areaPath = `${linePath} L ${lastPoint.x} ${height - paddingY} L ${firstPoint.x} ${height - paddingY} Z`;

  return (
    <View style={styles.container}>
      <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        <Defs>
          <LinearGradient id="spendingGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={colors.primary} stopOpacity={0.3} />
            <Stop offset="100%" stopColor={colors.primary} stopOpacity={0.0} />
          </LinearGradient>
        </Defs>

        {/* Gradient fill under trend line */}
        <Path d={areaPath} fill="url(#spendingGradient)" />

        {/* Trend line */}
        <Path
          d={linePath}
          fill="none"
          stroke={colors.primary}
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points & labels */}
        {points.map((pt, idx) => (
          <React.Fragment key={pt.month}>
            <Circle
              cx={pt.x}
              cy={pt.y}
              r={5}
              fill={colors.card}
              stroke={colors.primary}
              strokeWidth={2.5}
            />
            <SvgText
              x={pt.x}
              y={height - 5}
              fontSize="11"
              fill={colors.textSecondary}
              textAnchor="middle"
              fontWeight="500"
            >
              {pt.month}
            </SvgText>
          </React.Fragment>
        ))}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xs,
  },
});
