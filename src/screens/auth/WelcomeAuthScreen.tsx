import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { AppText } from '../../components/ui/AppText';
import { AppButton } from '../../components/ui/AppButton';
import { Icon } from '../../components/ui/Icon';
import { RADIUS, SPACING } from '../../constants/theme';

export const WelcomeAuthScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { sessionExpiredMessage } = useAuth();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: insets.top + SPACING.xl,
          paddingBottom: insets.bottom + SPACING.lg,
        },
      ]}
      bounces={false}
    >
      {/* Session Expired Notice if applicable */}
      {sessionExpiredMessage ? (
        <View
          style={[
            styles.sessionExpiredBox,
            { backgroundColor: colors.negativeBg, borderColor: colors.negative + '30' },
          ]}
        >
          <Icon name="AlertCircle" size={16} color={colors.negative} />
          <AppText
            variant="xs"
            weight="medium"
            style={{ color: colors.negative, flex: 1, marginLeft: 8 }}
          >
            {sessionExpiredMessage}
          </AppText>
        </View>
      ) : null}

      {/* Editorial Brand Intro */}
      <View style={styles.introSection}>
        <View
          style={[
            styles.logoContainer,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <Icon name="TrendingUp" size={26} color={colors.primary} strokeWidth={2} />
        </View>

        <AppText variant="xs" color="secondary" weight="semibold" style={styles.kicker}>
          WEALTHFLOW
        </AppText>

        <AppText variant="xxl" weight="bold" style={styles.heading}>
          Clarity, precision, and confidence in your personal finances.
        </AppText>

        <AppText variant="sm" color="secondary" style={styles.subheading}>
          A quiet, focused ledger for tracking cash flow, category budgets, and savings goals without clutter.
        </AppText>
      </View>

      {/* Action Buttons & Quiet Footer */}
      <View style={styles.actionSection}>
        <AppButton
          title="Create Account"
          onPress={() => navigation.navigate('SignUp')}
          variant="primary"
          size="lg"
          fullWidth
          style={styles.actionBtn}
        />

        <AppButton
          title="Sign In"
          onPress={() => navigation.navigate('SignIn')}
          variant="outline"
          size="lg"
          fullWidth
          style={styles.actionBtn}
        />

        <View style={styles.footerNote}>
          <Icon name="lock" size={12} color={colors.textMuted} />
          <AppText variant="xs" color="muted" align="center">
            Encrypted storage & authenticated cloud backup.
          </AppText>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: SPACING.xl,
    justifyContent: 'space-between',
  },
  sessionExpiredBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    marginBottom: SPACING.md,
  },
  introSection: {
    marginTop: SPACING.xl,
    alignItems: 'flex-start',
  },
  logoContainer: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  kicker: {
    letterSpacing: 1.5,
    marginBottom: SPACING.xs,
  },
  heading: {
    lineHeight: 34,
    letterSpacing: -0.5,
    marginBottom: SPACING.md,
  },
  subheading: {
    lineHeight: 22,
    maxWidth: 320,
  },
  actionSection: {
    gap: SPACING.sm + 2,
    marginTop: SPACING.xxl,
  },
  actionBtn: {
    width: '100%',
  },
  footerNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: SPACING.md,
    paddingVertical: SPACING.xs,
  },
});
