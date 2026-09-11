import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { RADIUS, SPACING, SHADOWS } from '../../constants/theme';

export interface AppCardProps {
  onPress?: () => void;
  variant?: 'default' | 'outlined' | 'elevated';
  padding?: keyof typeof SPACING;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
  testID?: string;
}

export const AppCard: React.FC<AppCardProps> = ({
  onPress,
  variant = 'default',
  padding = 'md',
  style,
  children,
  testID,
}) => {
  const { colors, isDark } = useTheme();

  const cardStyle = [
    styles.card,
    {
      backgroundColor: colors.card,
      borderColor: colors.border,
      padding: SPACING[padding],
    },
    variant === 'outlined' && { borderWidth: 1 },
    variant === 'elevated' && (!isDark ? SHADOWS.md : { borderWidth: 1 }),
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={cardStyle} testID={testID}>
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={cardStyle} testID={testID}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
});
