import React from 'react';
import { Modal, View, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { RADIUS, SPACING } from '../../constants/theme';
import { AppText } from './AppText';
import { AppButton } from './AppButton';
import { Icon } from './Icon';

export interface ConfirmationModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDanger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDanger = true,
  onConfirm,
  onCancel,
}) => {
  const { colors } = useTheme();

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={[styles.overlay, { backgroundColor: colors.modalOverlay }]}>
          <TouchableWithoutFeedback>
            <View style={[styles.dialog, { backgroundColor: colors.surface }]}>
              <View
                style={[
                  styles.iconWrapper,
                  { backgroundColor: isDanger ? colors.negativeBg : colors.infoBg },
                ]}
              >
                <Icon
                  name={isDanger ? 'alert-triangle' : 'help-circle'}
                  size={28}
                  color={isDanger ? colors.negative : colors.info}
                />
              </View>

              <AppText variant="lg" weight="bold" align="center" style={styles.title}>
                {title}
              </AppText>
              <AppText variant="sm" color="secondary" align="center" style={styles.message}>
                {message}
              </AppText>

              <View style={styles.buttonRow}>
                <AppButton
                  title={cancelLabel}
                  onPress={onCancel}
                  variant="outline"
                  size="md"
                  style={styles.button}
                />
                <AppButton
                  title={confirmLabel}
                  onPress={onConfirm}
                  variant={isDanger ? 'danger' : 'primary'}
                  size="md"
                  style={styles.button}
                />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  dialog: {
    width: '100%',
    maxWidth: 340,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
  },
  iconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    marginBottom: SPACING.xs,
  },
  message: {
    marginBottom: SPACING.lg,
    lineHeight: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    width: '100%',
  },
  button: {
    flex: 1,
  },
});
