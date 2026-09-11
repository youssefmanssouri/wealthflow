import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { AppText } from '../../components/ui/AppText';
import { AppButton } from '../../components/ui/AppButton';
import { Icon } from '../../components/ui/Icon';

export const WelcomeAuthScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 20 },
      ]}
    >
      {/* Brand Hero */}
      <View style={styles.heroSection}>
        <View style={[styles.logoBadge, { backgroundColor: colors.primary + '20' }]}>
          <Icon name="TrendingUp" size={42} color={colors.primary} strokeWidth={2.5} />
        </View>
        <AppText variant="giant" weight="bold" style={styles.brandTitle}>
          WealthFlow
        </AppText>
        <AppText variant="md" style={[styles.brandSubtitle, { color: colors.textSecondary }]}>
          Master your money with clarity, precision, and confidence.
        </AppText>
      </View>

      {/* Feature Highlights */}
      <View style={styles.featuresContainer}>
        <View style={[styles.featureCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.featureIcon, { backgroundColor: '#10B98120' }]}>
            <Icon name="PieChart" size={24} color="#10B981" />
          </View>
          <View style={styles.featureText}>
            <AppText variant="lg" weight="semibold">Smart Analytics</AppText>
            <AppText variant="xs" style={{ color: colors.textSecondary }}>
              Understand spending trends and category balances effortlessly.
            </AppText>
          </View>
        </View>

        <View style={[styles.featureCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.featureIcon, { backgroundColor: '#3B82F620' }]}>
            <Icon name="ShieldCheck" size={24} color="#3B82F6" />
          </View>
          <View style={styles.featureText}>
            <AppText variant="lg" weight="semibold">Cloud Persistence</AppText>
            <AppText variant="xs" style={{ color: colors.textSecondary }}>
              Your financial data is encrypted and securely synced with Supabase.
            </AppText>
          </View>
        </View>

        <View style={[styles.featureCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.featureIcon, { backgroundColor: '#8B5CF620' }]}>
            <Icon name="Target" size={24} color="#8B5CF6" />
          </View>
          <View style={styles.featureText}>
            <AppText variant="lg" weight="semibold">Goal Tracking</AppText>
            <AppText variant="xs" style={{ color: colors.textSecondary }}>
              Track emergency savings and milestone goals with precision.
            </AppText>
          </View>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actionSection}>
        <AppButton
          title="Create Account"
          onPress={() => navigation.navigate('SignUp')}
          variant="primary"
          icon="UserPlus"
          style={styles.btn}
        />
        <AppButton
          title="Sign In"
          onPress={() => navigation.navigate('SignIn')}
          variant="secondary"
          icon="LogIn"
          style={styles.btn}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 24, justifyContent: 'space-between' },
  heroSection: { alignItems: 'center', marginVertical: 20 },
  logoBadge: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  brandTitle: { fontSize: 34, fontWeight: '800', letterSpacing: -0.5 },
  brandSubtitle: { textAlign: 'center', marginTop: 8, paddingHorizontal: 20, lineHeight: 22 },
  featuresContainer: { gap: 12, marginVertical: 24 },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 14,
  },
  featureIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  featureText: { flex: 1 },
  actionSection: { gap: 12, marginTop: 10 },
  btn: { width: '100%' },
});
