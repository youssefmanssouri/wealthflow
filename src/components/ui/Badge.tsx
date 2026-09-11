import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { RADIUS, SPACING, TYPOGRAPHY } from '../../constants/theme';

export interface BadgeProps {
  label: string;
  variant?: 'healthy' | 'warning' | 'over_budget' | 'positive' | 'negative' | 'info' | 'neutral';
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({ label, variant = 'neutral', style }) => {
  const { colors } = useTheme();

  const getColors = () => {
    switch (variant) {
      case 'healthy':
      case 'positive':
        return { bg: colors.positiveBg, text: colors.positive };
      case 'warning':
        return { bg: colors.warningBg, text: colors.warning };
      case 'over_budget':
      case 'negative':
        return { bg: colors.negativeBg, text: colors.negative };
      case 'info':
        return { bg: colors.infoBg, text: colors.info };
      case 'neutral':
      default:
        return { bg: colors.inputBg, text: colors.textSecondary };
    }
  };

  const { bg, text } = getColors();

  return (
    <View style={[styles.badge, { backgroundColor: bg }, style]}>
      <Text style={[styles.text, { color: text }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
});
