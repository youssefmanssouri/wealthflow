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

export const SignInScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { signIn, sessionExpiredMessage, clearSessionExpiredMessage } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const displayMessage = errorMsg || sessionExpiredMessage;

  const handleSignIn = async () => {
    if (loading) return;
    setErrorMsg('');
    if (sessionExpiredMessage) {
      clearSessionExpiredMessage();
    }
    if (!email.trim() || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setLoading(true);
    const res = await signIn(email.trim(), password);
    setLoading(false);

    if (!res.success && res.error) {
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
            Sign In
          </AppText>
          <AppText variant="sm" color="secondary" style={styles.subtitle}>
            Enter your credentials to access your financial records.
          </AppText>
        </View>

        {/* Form Body */}
        <View style={styles.form}>
          {displayMessage ? (
            <View
              style={[
                styles.errorBox,
                { backgroundColor: colors.negativeBg, borderColor: colors.negative + '30' },
              ]}
            >
              <Icon name="AlertCircle" size={16} color={colors.negative} />
              <AppText variant="xs" weight="medium" style={[styles.errorText, { color: colors.negative }]}>
                {displayMessage}
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

          <AppInput
            label="Password"
            placeholder="••••••••"
            icon="lock"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            onPress={() => navigation.navigate('ForgotPassword')}
            style={styles.forgotBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <AppText variant="xs" color="brand" weight="medium">
              Forgot password?
            </AppText>
          </TouchableOpacity>

          <AppButton
            title="Sign In"
            onPress={handleSignIn}
            loading={loading}
            variant="primary"
            size="lg"
            fullWidth
            style={{ marginTop: SPACING.xs }}
          />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <AppText variant="xs" color="secondary">
            Don't have an account?{' '}
          </AppText>
          <TouchableOpacity
            onPress={() => navigation.navigate('SignUp')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <AppText variant="xs" color="brand" weight="semibold">
              Create Account
            </AppText>
          </TouchableOpacity>
        </View>
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
    justifyContent: 'space-between',
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
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: SPACING.lg,
    marginTop: -SPACING.xs,
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
});
