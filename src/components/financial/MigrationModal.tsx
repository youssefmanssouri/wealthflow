import React, { useState } from 'react';
import { View, StyleSheet, Modal, ActivityIndicator } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
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
          <View style={[styles.iconBadge, { backgroundColor: colors.primary + '20' }]}>
            <Icon name="CloudUpload" size={32} color={colors.primary} />
          </View>

          <AppText variant="xxl" weight="bold" style={styles.title}>
            Import Local Financial Data?
          </AppText>

          <AppText variant="md" style={[styles.description, { color: colors.textSecondary }]}>
            We found financial data stored on this device. Would you like to import your existing transactions, budgets, and savings goals into your WealthFlow cloud account?
          </AppText>

          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color={colors.primary} />
              <AppText variant="xs" style={{ color: colors.textSecondary, marginTop: 8 }}>
                Synchronizing data with Supabase...
              </AppText>
            </View>
          ) : (
            <View style={styles.actionGroup}>
              <AppButton
                title="Import Data"
                onPress={handleImport}
                variant="primary"
                icon="DownloadCloud"
              />
              <AppButton
                title="Start Fresh"
                onPress={handleFresh}
                variant="secondary"
                icon="PlusCircle"
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
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
  },
  iconBadge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: { textAlign: 'center', marginBottom: 8 },
  description: { textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  loadingBox: { paddingVertical: 16, alignItems: 'center' },
  actionGroup: { width: '100%', gap: 12 },
});
