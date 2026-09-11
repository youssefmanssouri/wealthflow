import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleProp, TextStyle } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { TYPOGRAPHY } from '../../constants/theme';

export interface AppTextProps extends RNTextProps {
  variant?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'giant';
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';
  color?: 'primary' | 'secondary' | 'muted' | 'brand' | 'positive' | 'warning' | 'negative';
  align?: 'left' | 'center' | 'right';
  style?: StyleProp<TextStyle>;
  children: React.ReactNode;
}

export const AppText: React.FC<AppTextProps> = ({
  variant = 'md',
  weight = 'regular',
  color = 'primary',
  align = 'left',
  style,
  children,
  ...props
}) => {
  const { colors } = useTheme();

  const getColor = () => {
    switch (color) {
      case 'primary':
        return colors.textPrimary;
      case 'secondary':
        return colors.textSecondary;
      case 'muted':
        return colors.textMuted;
      case 'brand':
        return colors.primary;
      case 'positive':
        return colors.positive;
      case 'warning':
        return colors.warning;
      case 'negative':
        return colors.negative;
      default:
        return colors.textPrimary;
    }
  };

  return (
    <RNText
      style={[
        {
          fontSize: TYPOGRAPHY.fontSize[variant],
          fontWeight: TYPOGRAPHY.fontWeight[weight],
          color: getColor(),
          textAlign: align,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </RNText>
  );
};
