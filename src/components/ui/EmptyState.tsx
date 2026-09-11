import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { SPACING } from '../../constants/theme';
import { AppText } from './AppText';
import { Icon } from './Icon';
import { AppButton } from './AppButton';

export interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'wallet-cards',
  title,
  description,
  actionLabel,
  onAction,
  style,
}) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.iconWrapper, { backgroundColor: colors.inputBg }]}>
        <Icon name={icon} size={36} color={colors.primary} />
      </View>
      <AppText variant="lg" weight="semibold" align="center" style={styles.title}>
        {title}
      </AppText>
      <AppText variant="sm" color="secondary" align="center" style={styles.description}>
        {description}
      </AppText>
      {actionLabel && onAction && (
        <AppButton
          title={actionLabel}
          onPress={onAction}
          variant="primary"
          size="md"
          icon="plus"
          style={styles.actionButton}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    marginBottom: SPACING.xs,
  },
  description: {
    maxWidth: 280,
    lineHeight: 20,
    marginBottom: SPACING.lg,
  },
  actionButton: {
    minWidth: 160,
  },
});
