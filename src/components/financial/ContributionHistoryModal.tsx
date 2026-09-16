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
              <AppText variant="lg" weight="bold" numberOfLines={1}>
                {goal.name}
              </AppText>
              <AppText variant="xs" color="secondary" style={{ marginTop: 2 }}>
                Contribution History ({formatCurrency(goal.currentAmount, currency)} saved)
              </AppText>
            </View>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={[styles.closeIconBtn, { backgroundColor: colors.surface }]}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Close contribution history"
            >
              <Icon name="X" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Body Content */}
          <View style={styles.bodyContainer}>
            {loading ? (
              <View style={styles.stateContainer}>
                <ActivityIndicator size="small" color={colors.primary} />
                <AppText variant="sm" color="secondary" style={{ marginTop: SPACING.sm }}>
                  Loading contributions...
                </AppText>
              </View>
            ) : error ? (
              <View style={styles.stateContainer}>
                <View
                  style={[
                    styles.errorBox,
                    { backgroundColor: colors.negativeBg, borderColor: colors.negative + '40' },
                  ]}
                >
                  <Icon name="alert-circle" size={18} color={colors.negative} />
                  <AppText variant="xs" style={{ color: colors.negative, flex: 1 }}>
                    {error}
                  </AppText>
                </View>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={loadContributions}
                  style={[styles.retryBtn, { backgroundColor: colors.primaryLight }]}
                  accessibilityLabel="Retry loading contribution history"
                >
                  <Icon name="refresh-cw" size={14} color={colors.primary} />
                  <AppText variant="xs" weight="bold" color="brand">
                    Retry
                  </AppText>
                </TouchableOpacity>
              </View>
            ) : contributions.length === 0 ? (
              <View style={styles.stateContainer}>
                <View style={[styles.emptyIconCircle, { backgroundColor: colors.surface }]}>
                  <Icon name="piggy-bank" size={24} color={colors.textMuted} />
                </View>
                <AppText variant="sm" weight="semibold" style={{ marginTop: SPACING.sm }}>
                  No contributions yet
                </AppText>
                <AppText variant="xs" color="secondary" align="center" style={{ marginTop: 4, paddingHorizontal: SPACING.md }}>
                  Deposits made toward this savings goal will appear here in reverse chronological order.
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
                        <Icon name="arrow-down-left" size={16} color={colors.positive} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <AppText variant="sm" weight="bold">
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
            <AppText variant="sm" weight="bold" color="secondary">
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
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    maxHeight: '75%',
    borderRadius: RADIUS.xl,
    padding: 0,
    overflow: 'hidden',
    borderWidth: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  closeIconBtn: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.sm,
  },
  bodyContainer: {
    minHeight: 180,
    maxHeight: 360,
  },
  stateContainer: {
    flex: 1,
    minHeight: 180,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  emptyIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    width: '100%',
    marginBottom: SPACING.md,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: SPACING.xs + 2,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.full,
  },
  scrollView: {
    maxHeight: 360,
    width: '100%',
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    gap: SPACING.sm,
  },
  contributionItem: {
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    gap: SPACING.xs,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  contribIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteContainer: {
    paddingLeft: 44,
  },
  closeModalBtn: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
});
