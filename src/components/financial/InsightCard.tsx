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
        };
      case 'warning':
        return {
          icon: 'alert-triangle',
          color: colors.warning,
          bgColor: colors.warningBg,
        };
      case 'info':
      default:
        return {
          icon: 'lightbulb',
          color: colors.info,
          bgColor: colors.infoBg,
        };
    }
  };

  const { icon, color, bgColor } = getStyleProps();

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.iconWrapper, { backgroundColor: bgColor }]}>
        <Icon name={icon} size={20} color={color} />
      </View>
      <View style={styles.content}>
        <AppText variant="sm" weight="bold">
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
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    marginBottom: SPACING.sm,
    gap: SPACING.md,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
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
