import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { AppText } from '../../components/ui/AppText';
import { AppInput } from '../../components/ui/AppInput';
import { AppButton } from '../../components/ui/AppButton';
import { Icon } from '../../components/ui/Icon';

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
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 },
      ]}
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
        <AppText variant="giant" weight="bold">Reset Password</AppText>
        <AppText variant="md" style={{ color: colors.textSecondary, marginTop: 4 }}>
          Enter your email address to receive password reset instructions.
        </AppText>
      </View>

      {submitted ? (
        <View style={[styles.successBox, { backgroundColor: '#10B98115', borderColor: '#10B98140' }]}>
          <Icon name="CheckCircle2" size={32} color="#10B981" />
          <AppText variant="lg" weight="bold" style={{ color: '#10B981', textAlign: 'center' }}>
            Check your inbox
          </AppText>
          <AppText variant="md" style={{ color: colors.textSecondary, textAlign: 'center' }}>
            We've sent a password reset link to {email}.
          </AppText>
          <AppButton
            title="Back to Sign In"
            onPress={() => navigation.navigate('SignIn')}
            variant="secondary"
            style={{ width: '100%', marginTop: 12 }}
          />
        </View>
      ) : (
        <View style={styles.form}>
          {errorMsg ? (
            <View style={[styles.errorBox, { backgroundColor: '#EF444415', borderColor: '#EF444440' }]}>
              <Icon name="AlertCircle" size={18} color="#EF4444" />
              <AppText style={[styles.errorText, { color: '#EF4444' }]}>{errorMsg}</AppText>
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

          <AppButton
            title="Send Reset Link"
            onPress={handleReset}
            loading={loading}
            icon="Send"
            style={{ marginTop: 12 }}
          />
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 24, justifyContent: 'flex-start' },
  topNav: { marginBottom: 20 },
  backBtn: { width: 40, height: 40, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  titleSection: { marginBottom: 24 },
  form: { gap: 14 },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  errorText: { flex: 1, fontSize: 13 },
  successBox: {
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    gap: 12,
    marginTop: 20,
  },
});
