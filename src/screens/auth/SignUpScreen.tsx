import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { AppText } from '../../components/ui/AppText';
import { AppInput } from '../../components/ui/AppInput';
import { AppButton } from '../../components/ui/AppButton';
import { Icon } from '../../components/ui/Icon';

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

  const handleSignUp = async () => {
    setErrorMsg('');
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
      <View style={styles.topNav}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <Icon name="ArrowLeft" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <View style={styles.titleSection}>
        <AppText variant="giant" weight="bold">Create Account</AppText>
        <AppText variant="md" style={{ color: colors.textSecondary, marginTop: 4 }}>
          Start your financial journey with WealthFlow today.
        </AppText>
      </View>

      <View style={styles.form}>
        {errorMsg ? (
          <View style={[styles.errorBox, { backgroundColor: '#EF444415', borderColor: '#EF444440' }]}>
            <Icon name="AlertCircle" size={18} color="#EF4444" />
            <AppText style={[styles.errorText, { color: '#EF4444' }]}>{errorMsg}</AppText>
          </View>
        ) : null}

        <AppInput
          label="Full Name"
          placeholder="Youssef Mansour"
          icon="User"
          value={fullName}
          onChangeText={setFullName}
        />

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
          placeholder="At least 6 characters"
          icon="Lock"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <AppInput
          label="Confirm Password"
          placeholder="Re-enter password"
          icon="LockCheck"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        <AppButton
          title="Create Account"
          onPress={handleSignUp}
          loading={loading}
          icon="UserPlus"
          style={{ marginTop: 12 }}
        />
      </View>

      <View style={styles.footer}>
        <AppText variant="xs" style={{ color: colors.textSecondary }}>
          Already have an account?{' '}
        </AppText>
        <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
          <AppText variant="xs" style={{ color: colors.primary, fontWeight: '700' }}>
            Sign In
          </AppText>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 24, justifyContent: 'space-between' },
  topNav: { marginBottom: 20 },
  backBtn: { width: 40, height: 40, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  titleSection: { marginBottom: 20 },
  form: { gap: 12 },
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
