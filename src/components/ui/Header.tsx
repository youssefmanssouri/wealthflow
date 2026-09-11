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
  style?: ViewStyle;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  onBack,
  rightActionIcon,
  onRightAction,
  style,
}) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, style]}>
      <View style={styles.leftSection}>
        {showBack && onBack ? (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onBack}
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
