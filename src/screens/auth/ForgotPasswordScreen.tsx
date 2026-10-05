import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { AppText } from '../../components/ui/AppText';
import { AppInput } from '../../components/ui/AppInput';
import { AppButton } from '../../components/ui/AppButton';
import { Icon } from '../../components/ui/Icon';
import { RADIUS, SPACING } from '../../constants/theme';

export const ForgotPasswordScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { resetPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleReset = async () => {
    setErrorMsg('');
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    const res = await resetPassword(email.trim());
    setLoading(false);

    if (res.success) {
      setSubmitted(true);
    } else if (res.error) {
      setErrorMsg(res.error);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + SPACING.md, paddingBottom: insets.bottom + SPACING.lg },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Navigation Bar */}
        <View style={styles.topNav}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={[styles.backBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Icon name="arrow-left" size={18} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Title Section */}
        <View style={styles.titleSection}>
          <AppText variant="xl" weight="bold" style={styles.title}>
            Reset Password
          </AppText>
          <AppText variant="sm" color="secondary" style={styles.subtitle}>
            Enter your account email to receive a password reset link.
          </AppText>
        </View>

        {submitted ? (
          <View
            style={[
              styles.successCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View
              style={[
                styles.iconBadge,
                { backgroundColor: colors.positiveBg, borderColor: colors.positive + '30' },
              ]}
            >
              <Icon name="CheckCircle2" size={22} color={colors.positive} strokeWidth={2} />
            </View>
            <AppText variant="md" weight="bold" style={styles.successTitle}>
              Check your inbox
            </AppText>
            <AppText variant="sm" color="secondary" align="center" style={styles.successMessage}>
              We have dispatched password reset instructions to {email}. Follow the link in the message to set a new password.
            </AppText>
            <AppButton
              title="Return to Sign In"
              onPress={() => navigation.navigate('SignIn')}
              variant="outline"
              size="md"
              fullWidth
              style={{ marginTop: SPACING.md }}
            />
          </View>
        ) : (
          <View style={styles.form}>
            {errorMsg ? (
              <View
                style={[
                  styles.errorBox,
                  { backgroundColor: colors.negativeBg, borderColor: colors.negative + '30' },
                ]}
              >
                <Icon name="AlertCircle" size={16} color={colors.negative} />
                <AppText variant="xs" weight="medium" style={[styles.errorText, { color: colors.negative }]}>
                  {errorMsg}
                </AppText>
              </View>
            ) : null}

            <AppInput
              label="Email Address"
              placeholder="youssef@example.com"
              icon="mail"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <AppButton
              title="Send Reset Link"
              onPress={handleReset}
              loading={loading}
              variant="primary"
              size="lg"
              fullWidth
              style={{ marginTop: SPACING.sm }}
            />
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: SPACING.xl,
    flexGrow: 1,
  },
  topNav: {
    marginBottom: SPACING.lg,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleSection: {
    marginBottom: SPACING.xl,
  },
  title: {
    letterSpacing: -0.3,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    lineHeight: 20,
  },
  form: {
    flex: 1,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    gap: 8,
    marginBottom: SPACING.md,
  },
  errorText: {
    flex: 1,
  },
  successCard: {
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    padding: SPACING.xl,
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  successTitle: {
    marginBottom: SPACING.xs,
  },
  successMessage: {
    lineHeight: 20,
  },
});
