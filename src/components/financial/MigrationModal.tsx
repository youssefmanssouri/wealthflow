import React, { useState } from 'react';
import { View, StyleSheet, Modal, ActivityIndicator } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { RADIUS, SPACING } from '../../constants/theme';
import { AppText } from '../ui/AppText';
import { AppButton } from '../ui/AppButton';
import { Icon } from '../ui/Icon';

interface MigrationModalProps {
  visible: boolean;
  onImport: () => Promise<void>;
  onStartFresh: () => Promise<void>;
}

export const MigrationModal: React.FC<MigrationModalProps> = ({
  visible,
  onImport,
  onStartFresh,
}) => {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);

  const handleImport = async () => {
    setLoading(true);
    await onImport();
    setLoading(false);
  };

  const handleFresh = async () => {
    setLoading(true);
    await onStartFresh();
    setLoading(false);
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View
            style={[
              styles.iconBadge,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Icon name="upload-cloud" size={20} color={colors.primary} strokeWidth={2} />
          </View>

          <AppText variant="lg" weight="bold" style={styles.title}>
            Import Local Financial Data?
          </AppText>

          <AppText variant="sm" color="secondary" style={styles.description}>
            We found financial records stored on this device. Would you like to import your existing transactions, budgets, and savings goals into your authenticated account?
          </AppText>

          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="small" color={colors.primary} />
              <AppText variant="xs" color="secondary" style={{ marginTop: 8 }}>
                Synchronizing data...
              </AppText>
            </View>
          ) : (
            <View style={styles.actionGroup}>
              <AppButton
                title="Import Data"
                onPress={handleImport}
                variant="primary"
                size="md"
                icon="download-cloud"
                fullWidth
              />
              <AppButton
                title="Start Fresh"
                onPress={handleFresh}
                variant="outline"
                size="md"
                fullWidth
              />
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    padding: SPACING.xl,
    alignItems: 'center',
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  description: {
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.lg,
  },
  loadingBox: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  actionGroup: {
    width: '100%',
    gap: SPACING.sm,
  },
});
