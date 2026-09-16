import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { AppText } from '../../components/ui/AppText';
import { AppInput } from '../../components/ui/AppInput';
import { AppButton } from '../../components/ui/AppButton';
import { Icon } from '../../components/ui/Icon';

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
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 },
      ]}
      keyboardShouldPersistTaps="handled"
    >
      {/* Top Header */}
      <View style={styles.topNav}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <Icon name="ArrowLeft" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <View style={styles.titleSection}>
        <AppText variant="giant" weight="bold">Welcome Back</AppText>
        <AppText variant="md" style={{ color: colors.textSecondary, marginTop: 4 }}>
          Sign in to access your WealthFlow account.
        </AppText>
      </View>

      {/* Form */}
      <View style={styles.form}>
        {displayMessage ? (
          <View style={[styles.errorBox, { backgroundColor: '#EF444415', borderColor: '#EF444440' }]}>
            <Icon name="AlertCircle" size={18} color="#EF4444" />
            <AppText style={[styles.errorText, { color: '#EF4444' }]}>{displayMessage}</AppText>
          </View>
        ) : null}

        <AppInput
          label="Email Address"
          placeholder="youssef@example.com"
          icon="Mail"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <AppInput
          label="Password"
          placeholder="••••••••"
          icon="Lock"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          onPress={() => navigation.navigate('ForgotPassword')}
          style={styles.forgotBtn}
        >
          <AppText variant="xs" style={{ color: colors.primary, fontWeight: '600' }}>
            Forgot password?
          </AppText>
        </TouchableOpacity>

        <AppButton
          title="Sign In"
          onPress={handleSignIn}
          loading={loading}
          icon="LogIn"
          style={{ marginTop: 12 }}
        />
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <AppText variant="xs" style={{ color: colors.textSecondary }}>
          Don't have an account?{' '}
        </AppText>
        <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
          <AppText variant="xs" style={{ color: colors.primary, fontWeight: '700' }}>
            Create Account
          </AppText>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 24, justifyContent: 'space-between', minHeight: 600 },
  topNav: { marginBottom: 20 },
  backBtn: { width: 40, height: 40, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  titleSection: { marginBottom: 24 },
  form: { gap: 14, flex: 1 },
  forgotBtn: { alignSelf: 'flex-end', marginTop: -6 },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  errorText: { flex: 1, fontSize: 13 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginVertical: 16 },
});
