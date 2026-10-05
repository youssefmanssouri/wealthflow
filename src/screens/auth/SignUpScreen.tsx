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

export const SignUpScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { signUp } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [confirmationMsg, setConfirmationMsg] = useState('');

  const handleSignUp = async () => {
    if (loading) return;
    setErrorMsg('');
    setConfirmationMsg('');
    if (!fullName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setLoading(true);
    const res = await signUp(fullName.trim(), email.trim(), password);
    setLoading(false);

    if (!res.success) {
      if (res.error) setErrorMsg(res.error);
    } else if (res.confirmationRequired) {
      setConfirmationMsg('Account created. Please check your inbox to verify your email, then sign in.');
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
            Create Account
          </AppText>
          <AppText variant="sm" color="secondary" style={styles.subtitle}>
            Set up your private personal finance ledger.
          </AppText>
        </View>

        {/* Form Body */}
        <View style={styles.form}>
          {confirmationMsg ? (
            <View
              style={[
                styles.messageBox,
                { backgroundColor: colors.positiveBg, borderColor: colors.positive + '30' },
              ]}
            >
              <Icon name="CheckCircle2" size={16} color={colors.positive} />
              <AppText variant="xs" weight="medium" style={[styles.messageText, { color: colors.positive }]}>
                {confirmationMsg}
              </AppText>
            </View>
          ) : null}

          {errorMsg ? (
            <View
              style={[
                styles.messageBox,
                { backgroundColor: colors.negativeBg, borderColor: colors.negative + '30' },
              ]}
            >
              <Icon name="AlertCircle" size={16} color={colors.negative} />
              <AppText variant="xs" weight="medium" style={[styles.messageText, { color: colors.negative }]}>
                {errorMsg}
              </AppText>
            </View>
          ) : null}

          <AppInput
            label="Full Name"
            placeholder="Youssef Mansouri"
            icon="user"
            value={fullName}
            onChangeText={setFullName}
            autoCorrect={false}
          />

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
            placeholder="At least 6 characters"
            icon="lock"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <AppInput
            label="Confirm Password"
            placeholder="Re-enter password"
            icon="lock"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />

          <AppButton
            title="Create Account"
            onPress={handleSignUp}
            loading={loading}
            variant="primary"
            size="lg"
            fullWidth
            style={{ marginTop: SPACING.sm }}
          />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <AppText variant="xs" color="secondary">
            Already have an account?{' '}
          </AppText>
          <TouchableOpacity
            onPress={() => navigation.navigate('SignIn')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <AppText variant="xs" color="brand" weight="semibold">
              Sign In
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
  messageBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    gap: 8,
    marginBottom: SPACING.md,
  },
  messageText: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
});
