import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { FinancialInsight } from '../../types/financial';
import { RADIUS, SPACING } from '../../constants/theme';
import { AppText } from '../ui/AppText';
import { Icon } from '../ui/Icon';

export interface InsightCardProps {
  insight: FinancialInsight;
}

export const InsightCard: React.FC<InsightCardProps> = ({ insight }) => {
  const { colors } = useTheme();

  const getStyleProps = () => {
    switch (insight.type) {
      case 'positive':
        return {
          icon: 'trending-up',
          color: colors.positive,
          bgColor: colors.positiveBg,
          borderColor: colors.positive + '30',
        };
      case 'warning':
        return {
          icon: 'alert-triangle',
          color: colors.warning,
          bgColor: colors.warningBg,
          borderColor: colors.warning + '30',
        };
      case 'info':
      default:
        return {
          icon: 'lightbulb',
          color: colors.primary,
          bgColor: colors.surface,
          borderColor: colors.border,
        };
    }
  };

  const { icon, color, bgColor, borderColor } = getStyleProps();

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.iconWrapper, { backgroundColor: bgColor, borderColor }]}>
        <Icon name={icon} size={16} color={color} strokeWidth={2} />
      </View>
      <View style={styles.content}>
        <AppText variant="sm" weight="semibold">
          {insight.title}
        </AppText>
        <AppText variant="xs" color="secondary" style={styles.message}>
          {insight.message}
        </AppText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    marginBottom: SPACING.sm,
    gap: SPACING.sm + 2,
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  message: {
    marginTop: 2,
    lineHeight: 18,
  },
});
