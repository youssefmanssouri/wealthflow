import React from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { RADIUS, SPACING, TYPOGRAPHY } from '../../constants/theme';
import { Icon } from './Icon';

export interface AppInputProps extends TextInputProps {
  label?: string;
  icon?: string;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<TextStyle>;
}

export const AppInput: React.FC<AppInputProps> = ({
  label,
  icon,
  error,
  containerStyle,
  style,
  ...props
}) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          {label}
        </Text>
      )}
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: colors.inputBg,
            borderColor: error ? colors.negative : colors.inputBorder,
          },
        ]}
      >
        {icon && (
          <View style={styles.iconContainer}>
            <Icon name={icon} size={18} color={colors.textMuted} />
          </View>
        )}
        <TextInput
          style={[
            styles.input,
            { color: colors.textPrimary },
            icon ? { paddingLeft: SPACING.xs } : null,
            style,
          ]}
          placeholderTextColor={colors.textMuted}
          {...props}
          accessibilityLabel={props.accessibilityLabel || label || props.placeholder}
          accessibilityState={{
            disabled: props.editable === false,
            ...props.accessibilityState,
          }}
          accessibilityHint={props.accessibilityHint || (error ? `Error: ${error}` : undefined)}
        />
      </View>
      {error && (
        <Text style={[styles.errorText, { color: colors.negative }]}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    marginBottom: SPACING.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    height: 48,
  },
  iconContainer: {
    marginRight: SPACING.xs,
  },
  input: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.md,
    height: '100%',
  },
  errorText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    marginTop: 4,
  },
});
