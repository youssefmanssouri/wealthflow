import React, { useEffect, useState, useCallback } from 'react';
import {
  Modal,
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useFinancial } from '../../context/FinancialContext';
import { savingsService } from '../../services/savingsService';
import { SavingsGoal, SavingsContribution } from '../../types/financial';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/date';
import { SPACING, RADIUS } from '../../constants/theme';
import { AppText } from '../ui/AppText';
import { Icon } from '../ui/Icon';

export interface ContributionHistoryModalProps {
  visible: boolean;
  goal: SavingsGoal | null;
  onClose: () => void;
}

export const ContributionHistoryModal: React.FC<ContributionHistoryModalProps> = ({
  visible,
  goal,
  onClose,
}) => {
  const { colors } = useTheme();
  const { currentUser } = useAuth();
  const { user } = useFinancial();
  const currency = user.preferences.currency;

  const [contributions, setContributions] = useState<SavingsContribution[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadContributions = useCallback(async () => {
    if (!goal || !currentUser) {
      setContributions([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const records = await savingsService.fetchContributions(currentUser.id, goal.id);
      setContributions(records);
    } catch (err: any) {
      setError(
        typeof err?.message === 'string' && err.message.length > 0
          ? err.message
          : 'Unable to load contribution history. Please check your network and try again.'
      );
    } finally {
      setLoading(false);
    }
  }, [goal, currentUser]);

  useEffect(() => {
    if (visible && goal) {
      loadContributions();
    } else {
      setContributions([]);
      setError(null);
      setLoading(false);
    }
  }, [visible, goal, loadContributions]);

  if (!goal) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={[
            styles.modalCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={{ flex: 1 }}>
              <AppText variant="md" weight="semibold" numberOfLines={1}>
                {goal.name}
              </AppText>
              <AppText variant="xs" color="secondary" style={{ marginTop: 2 }}>
                Contribution History ({formatCurrency(goal.currentAmount, currency)} saved)
              </AppText>
            </View>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={[styles.closeIconBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Close contribution history"
            >
              <Icon name="x" size={15} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Body Content */}
          <View style={styles.bodyContainer}>
            {loading ? (
              <View style={styles.stateContainer}>
                <ActivityIndicator size="small" color={colors.primary} />
                <AppText variant="xs" color="secondary" style={{ marginTop: SPACING.sm }}>
                  Loading contributions...
                </AppText>
              </View>
            ) : error ? (
              <View style={styles.stateContainer}>
                <View
                  style={[
                    styles.errorBox,
                    { backgroundColor: colors.negativeBg, borderColor: colors.negative + '30' },
                  ]}
                >
                  <Icon name="AlertCircle" size={16} color={colors.negative} />
                  <AppText variant="xs" style={{ color: colors.negative, flex: 1 }}>
                    {error}
                  </AppText>
                </View>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={loadContributions}
                  style={[styles.retryBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  accessibilityLabel="Retry loading contribution history"
                >
                  <Icon name="RefreshCw" size={13} color={colors.primary} />
                  <AppText variant="xs" weight="medium" color="brand">
                    Retry
                  </AppText>
                </TouchableOpacity>
              </View>
            ) : contributions.length === 0 ? (
              <View style={styles.stateContainer}>
                <View style={[styles.emptyIconContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Icon name="piggy-bank" size={20} color={colors.textMuted} />
                </View>
                <AppText variant="sm" weight="semibold" style={{ marginTop: SPACING.sm }}>
                  No contributions yet
                </AppText>
                <AppText variant="xs" color="secondary" align="center" style={{ marginTop: 4, paddingHorizontal: SPACING.md }}>
                  Deposits made toward this savings goal will appear here.
                </AppText>
              </View>
            ) : (
              <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={true}
              >
                {contributions.map((c) => (
                  <View
                    key={c.id}
                    style={[
                      styles.contributionItem,
                      { backgroundColor: colors.surface, borderColor: colors.border },
                    ]}
                  >
                    <View style={styles.itemLeft}>
                      <View
                        style={[
                          styles.contribIconWrap,
                          { backgroundColor: colors.positiveBg },
                        ]}
                      >
                        <Icon name="arrow-down-left" size={14} color={colors.positive} strokeWidth={2} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <AppText variant="sm" weight="semibold">
                          +{formatCurrency(c.amount, currency)}
                        </AppText>
                        <AppText variant="xs" color="secondary">
                          {formatDate(c.date || c.contributionDate || '')}
                        </AppText>
                      </View>
                    </View>
                    {c.note ? (
                      <View style={styles.noteContainer}>
                        <AppText variant="xs" color="muted" numberOfLines={2}>
                          "{c.note}"
                        </AppText>
                      </View>
                    ) : null}
                  </View>
                ))}
              </ScrollView>
            )}
          </View>

          {/* Footer */}
          <TouchableOpacity
            onPress={onClose}
            style={[styles.closeModalBtn, { borderTopWidth: 1, borderTopColor: colors.border }]}
            accessibilityLabel="Close"
          >
            <AppText variant="xs" weight="medium" color="secondary">
              Close
            </AppText>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    maxHeight: '75%',
    borderRadius: RADIUS.lg,
    padding: 0,
    overflow: 'hidden',
    borderWidth: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md + 4,
    paddingBottom: SPACING.sm + 2,
  },
  closeIconBtn: {
    width: 28,
    height: 28,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bodyContainer: {
    maxHeight: 360,
    paddingHorizontal: SPACING.lg,
  },
  scrollView: {
    maxHeight: 320,
  },
  scrollContent: {
    paddingVertical: SPACING.xs,
    gap: SPACING.xs + 2,
  },
  stateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyIconContainer: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    gap: 8,
    marginBottom: SPACING.sm,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    marginTop: SPACING.xs,
  },
  contributionItem: {
    padding: SPACING.sm + 2,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  contribIconWrap: {
    width: 28,
    height: 28,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteContainer: {
    marginTop: 4,
    paddingLeft: 36,
  },
  closeModalBtn: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
