import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { RADIUS, SPACING, TYPOGRAPHY } from '../../constants/theme';
import { Icon } from './Icon';

export interface AppButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: string;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const AppButton: React.FC<AppButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
  textStyle,
}) => {
  const { colors } = useTheme();

  const getBackgroundColor = () => {
    if (disabled) return colors.border;
    switch (variant) {
      case 'primary':
        return colors.primary;
      case 'secondary':
        return colors.primaryLight;
      case 'outline':
        return 'transparent';
      case 'danger':
        return colors.negative;
      case 'ghost':
        return 'transparent';
      default:
        return colors.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return colors.textMuted;
    switch (variant) {
      case 'primary':
        return '#FFFFFF';
      case 'secondary':
        return colors.primary;
      case 'outline':
        return colors.textPrimary;
      case 'danger':
        return '#FFFFFF';
      case 'ghost':
        return colors.textSecondary;
      default:
        return '#FFFFFF';
    }
  };

  const getPaddingHeight = () => {
    switch (size) {
      case 'sm':
        return SPACING.sm;
      case 'md':
        return SPACING.md - 2;
      case 'lg':
        return SPACING.md + 4;
    }
  };

  const getFontSize = (): keyof typeof TYPOGRAPHY.fontSize => {
    switch (size) {
      case 'sm':
        return 'sm';
      case 'md':
        return 'md';
      case 'lg':
        return 'lg';
    }
  };

  const textColor = getTextColor();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          paddingVertical: getPaddingHeight(),
          paddingHorizontal: size === 'sm' ? SPACING.md : SPACING.lg,
          borderColor: variant === 'outline' ? colors.border : 'transparent',
          borderWidth: variant === 'outline' ? 1.5 : 0,
        },
        fullWidth && styles.fullWidth,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <Icon
              name={icon}
              size={size === 'sm' ? 16 : 20}
              color={textColor}
              strokeWidth={2.5}
            />
          )}
          <Text
            style={[
              styles.text,
              {
                color: textColor,
                fontSize: TYPOGRAPHY.fontSize[getFontSize()],
                marginLeft: icon && iconPosition === 'left' ? SPACING.sm : 0,
                marginRight: icon && iconPosition === 'right' ? SPACING.sm : 0,
              },
              textStyle,
            ]}
          >
            {title}
          </Text>
          {icon && iconPosition === 'right' && (
            <Icon
              name={icon}
              size={size === 'sm' ? 16 : 20}
              color={textColor}
              strokeWidth={2.5}
            />
          )}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.md,
  },
  fullWidth: {
    width: '100%',
  },
  text: {
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
});
