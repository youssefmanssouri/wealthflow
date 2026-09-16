import React from 'react';
import { View, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { SPACING } from '../../constants/theme';
import { AppText } from './AppText';
import { Icon } from './Icon';

export interface HeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightActionIcon?: string;
  onRightAction?: () => void;
  rightActionAccessibilityLabel?: string;
  style?: ViewStyle;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  onBack,
  rightActionIcon,
  onRightAction,
  rightActionAccessibilityLabel,
  style,
}) => {
  const { colors } = useTheme();

  const getRightActionLabel = () => {
    if (rightActionAccessibilityLabel) return rightActionAccessibilityLabel;
    if (rightActionIcon === 'plus') {
      const lower = title.toLowerCase();
      if (lower.includes('transaction')) return 'Add transaction';
      if (lower.includes('saving')) return 'Add savings goal';
      if (lower.includes('budget')) return 'Add budget';
      return `Add ${title}`;
    }
    return `${title} action`;
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.leftSection}>
        {showBack && onBack ? (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onBack}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={[styles.iconButton, { backgroundColor: colors.inputBg }]}
          >
            <Icon name="arrow-left" size={20} color={colors.textPrimary} />
          </TouchableOpacity>
        ) : null}
        <View style={showBack ? { marginLeft: SPACING.sm } : null}>
          <AppText variant="xl" weight="bold">
            {title}
          </AppText>
          {subtitle && (
            <AppText variant="xs" color="secondary" style={{ marginTop: 2 }}>
              {subtitle}
            </AppText>
          )}
        </View>
      </View>

      {rightActionIcon && onRightAction ? (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onRightAction}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={getRightActionLabel()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={[styles.iconButton, { backgroundColor: colors.inputBg }]}
        >
          <Icon name={rightActionIcon} size={20} color={colors.textPrimary} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
