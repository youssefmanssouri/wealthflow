import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useFinancial } from '../context/FinancialContext';
import { useAuth } from '../context/AuthContext';
import { profileService } from '../services/profileService';
import { exportFinancialData } from '../utils/exportService';
import { CURRENCY_NAMES, CURRENCY_SYMBOLS, CURRENCY_FLAGS, SUPPORTED_CURRENCIES } from '../utils/currency';
import { SPACING, RADIUS } from '../constants/theme';
import { AppText } from '../components/ui/AppText';
import { Header } from '../components/ui/Header';
import { Icon } from '../components/ui/Icon';
import { SegmentedControl } from '../components/ui/SegmentedControl';
import { ConfirmationModal } from '../components/ui/ConfirmationModal';
import { AppInput } from '../components/ui/AppInput';
import { AppButton } from '../components/ui/AppButton';
import { Currency, ThemeMode } from '../types/financial';

export const ProfileScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors, isDark, themeMode, setThemeMode } = useTheme();
  const { user, transactions, budgets, savingsGoals, setCurrency, resetToDefaultData, clearAllUserData } = useFinancial();
  const { currentUser, signOut, deleteAccount, updateProfileState } = useAuth();

  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  
  // Edit Profile Modal State
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [editName, setEditName] = useState(currentUser?.fullName || user.name);
  const [editLoading, setEditLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const activeCurrency = user.preferences.currency;

  const handleCurrencySelect = async (curr: Currency) => {
    await setCurrency(curr);
    setShowCurrencyModal(false);
  };

  const handleSaveProfile = async () => {
    if (!editName.trim() || !currentUser) return;
    setEditLoading(true);
    const res = await profileService.updateProfile(currentUser.id, { fullName: editName.trim() });
    setEditLoading(false);
    if (res.success) {
      updateProfileState({ fullName: editName.trim() });
      setShowEditProfileModal(false);
    } else {
      Alert.alert('Error', res.error || 'Failed to update profile.');
    }
  };

  const handleExportData = async () => {
    if (isExporting) return;
    setIsExporting(true);

    try {
      const profile = {
        name: currentUser?.fullName || user.name,
        email: currentUser?.email || user.email,
        currency: activeCurrency,
      };

      const result = await exportFinancialData(
        profile,
        transactions,
        budgets,
        savingsGoals
      );

      if (!result.success) {
        Alert.alert('Export Failed', result.error);
      }
    } catch (err: any) {
      Alert.alert(
        'Export Failed',
        err?.message || 'An unexpected error occurred while preparing your export. Please try again.'
      );
    } finally {
      setIsExporting(false);
    }
  };

  const handleConfirmSignOut = async () => {
    setShowSignOutModal(false);
    await signOut();
  };

  const handleConfirmDeleteAccount = async () => {
    if (isDeletingAccount) return;
    setIsDeletingAccount(true);

    try {
      const res = await deleteAccount();
      if (!res.success) {
        setIsDeletingAccount(false);
        Alert.alert(
          'Account Deletion Failed',
          res.error || 'Failed to delete your account. Please check your connection and try again.'
        );
        return;
      }

      // Server deletion is confirmed. Purge local financial data and storage before signing out.
      try {
        await clearAllUserData();
      } catch (cleanupErr) {
        console.error('Error clearing local user data after account deletion:', cleanupErr);
      }

      // Dismiss modal and sign out so AppNavigator transitions cleanly to AuthNavigator.
      setShowDeleteAccountModal(false);
      await signOut();
    } catch (err: any) {
      setIsDeletingAccount(false);
      Alert.alert(
        'Account Deletion Failed',
        err?.message || 'An unexpected error occurred while deleting your account. Please try again.'
      );
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <Header title="Profile & Settings" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* User Identity Card */}
        <View
          style={[
            styles.profileCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <AppText variant="xl" weight="bold" style={{ color: '#FFFFFF' }}>
              {(currentUser?.fullName || user.name).charAt(0).toUpperCase()}
            </AppText>
          </View>
          <View style={styles.profileDetails}>
            <AppText variant="lg" weight="bold">
              {currentUser?.fullName || user.name}
            </AppText>
            <AppText variant="sm" color="secondary">
              {currentUser?.email || user.email}
            </AppText>
            <View style={[styles.proBadge, { backgroundColor: colors.positiveBg }]}>
              <AppText variant="xs" weight="bold" color="positive">
                Cloud Authenticated Account
              </AppText>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => {
              setEditName(currentUser?.fullName || user.name);
              setShowEditProfileModal(true);
            }}
            style={[styles.editBtn, { backgroundColor: colors.primary + '15' }]}
          >
            <Icon name="Edit3" size={18} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Appearance Section */}
        <View style={styles.section}>
          <AppText variant="sm" weight="semibold" color="secondary" style={styles.sectionHeader}>
            APPEARANCE & THEME
          </AppText>

          <View
            style={[
              styles.settingCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <SegmentedControl
              options={[
                { label: 'Light', value: 'light' },
                { label: 'Dark', value: 'dark' },
                { label: 'System', value: 'system' },
              ]}
              selectedValue={themeMode}
              onSelect={(val) => setThemeMode(val as ThemeMode)}
            />
          </View>
        </View>

        {/* Financial Preferences Section */}
        <View style={styles.section}>
          <AppText variant="sm" weight="semibold" color="secondary" style={styles.sectionHeader}>
            PREFERENCES
          </AppText>

          <View
            style={[
              styles.settingCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            {/* Currency Selector */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setShowCurrencyModal(true)}
              style={styles.settingRow}
            >
              <View style={styles.rowLeft}>
                <View style={[styles.iconWrapper, { backgroundColor: colors.infoBg }]}>
                  <Icon name="DollarSign" size={20} color={colors.info} />
                </View>
                <View>
                  <AppText variant="md" weight="semibold">
                    Currency
                  </AppText>
                  <AppText variant="xs" color="secondary">
                    {CURRENCY_NAMES[activeCurrency]}
                  </AppText>
                </View>
              </View>
              <View style={styles.rowRight}>
                <AppText variant="sm" weight="bold" color="brand">
                  {CURRENCY_SYMBOLS[activeCurrency]}
                </AppText>
                <Icon name="ChevronRight" size={20} color={colors.textMuted} />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Data & Privacy Section */}
        <View style={styles.section}>
          <AppText variant="sm" weight="semibold" color="secondary" style={styles.sectionHeader}>
            DATA & PRIVACY
          </AppText>

          <View
            style={[
              styles.settingCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleExportData}
              disabled={isExporting}
              style={[styles.settingRow, isExporting && { opacity: 0.6 }]}
            >
              <View style={styles.rowLeft}>
                <View style={[styles.iconWrapper, { backgroundColor: colors.primaryLight }]}>
                  {isExporting ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    <Icon name="Download" size={20} color={colors.primary} />
                  )}
                </View>
                <View>
                  <AppText variant="md" weight="semibold">
                    {isExporting ? 'Exporting Data...' : 'Export Financial Data'}
                  </AppText>
                  <AppText variant="xs" color="secondary">
                    {isExporting ? 'Generating JSON file...' : 'Download backup in JSON format'}
                  </AppText>
                </View>
              </View>
              {isExporting ? (
                <ActivityIndicator size="small" color={colors.textMuted} />
              ) : (
                <Icon name="ChevronRight" size={20} color={colors.textMuted} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Account Actions Section */}
        <View style={styles.section}>
          <AppText variant="sm" weight="semibold" color="secondary" style={styles.sectionHeader}>
            ACCOUNT ACTIONS
          </AppText>

          <View
            style={[
              styles.settingCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            {/* Sign Out */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setShowSignOutModal(true)}
              style={styles.settingRow}
            >
              <View style={styles.rowLeft}>
                <View style={[styles.iconWrapper, { backgroundColor: '#3B82F620' }]}>
                  <Icon name="LogOut" size={20} color="#3B82F6" />
                </View>
                <View>
                  <AppText variant="md" weight="semibold">
                    Sign Out
                  </AppText>
                  <AppText variant="xs" color="secondary">
                    Log out of your WealthFlow session
                  </AppText>
                </View>
              </View>
              <Icon name="ChevronRight" size={20} color={colors.textMuted} />
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            {/* Delete Account */}
            <TouchableOpacity
              activeOpacity={0.7}
              disabled={isDeletingAccount}
              onPress={() => setShowDeleteAccountModal(true)}
              style={[styles.settingRow, isDeletingAccount && { opacity: 0.5 }]}
            >
              <View style={styles.rowLeft}>
                <View style={[styles.iconWrapper, { backgroundColor: colors.negativeBg }]}>
                  <Icon name="Trash2" size={20} color={colors.negative} />
                </View>
                <View>
                  <AppText variant="md" weight="semibold" color="negative">
                    Delete Account
                  </AppText>
                  <AppText variant="xs" color="secondary">
                    Permanently delete user profile and cloud data
                  </AppText>
                </View>
              </View>
              <Icon name="ChevronRight" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.appFooter}>
          <AppText variant="sm" weight="bold" align="center" color="secondary">
            WealthFlow Mobile App
          </AppText>
          <AppText variant="xs" color="muted" align="center" style={{ marginTop: 2 }}>
            Authenticated & Persistent Cloud Synchronization
          </AppText>
          <AppText variant="xs" color="muted" align="center" style={{ marginTop: 4 }}>
            Version 2.0.0 (Phase 2 Build)
          </AppText>
          <AppText variant="xs" weight="medium" color="secondary" align="center" style={{ marginTop: 8 }}>
            Built by Youssef Manssouri
          </AppText>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={showEditProfileModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <AppText variant="xxl" weight="bold" style={{ marginBottom: 12 }}>
              Edit Profile
            </AppText>
            <AppInput
              label="Full Name"
              placeholder="Your full name"
              icon="User"
              value={editName}
              onChangeText={setEditName}
            />
            <View style={styles.modalBtnRow}>
              <AppButton
                title="Cancel"
                onPress={() => setShowEditProfileModal(false)}
                variant="secondary"
                style={{ flex: 1 }}
              />
              <AppButton
                title="Save Changes"
                onPress={handleSaveProfile}
                loading={editLoading}
                variant="primary"
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Currency Selector Modal */}
      <Modal
        visible={showCurrencyModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCurrencyModal(false)}
      >
        <TouchableOpacity
          style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.65)' }]}
          activeOpacity={1}
          onPress={() => setShowCurrencyModal(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={[
              styles.modalCard,
              styles.currencyModalCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={styles.currencyModalHeader}>
              <View>
                <AppText variant="lg" weight="bold">
                  Select Currency
                </AppText>
                <AppText variant="xs" color="secondary" style={{ marginTop: 2 }}>
                  Choose your preferred display currency
                </AppText>
              </View>
              <TouchableOpacity
                onPress={() => setShowCurrencyModal(false)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={[styles.closeIconBtn, { backgroundColor: colors.surface }]}
              >
                <Icon name="X" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.currencyScrollView}
              contentContainerStyle={styles.currencyScrollContent}
              showsVerticalScrollIndicator={true}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled={true}
            >
              {SUPPORTED_CURRENCIES.map((curr) => {
                const isSelected = activeCurrency === curr;
                return (
                  <TouchableOpacity
                    key={curr}
                    activeOpacity={0.7}
                    onPress={() => handleCurrencySelect(curr)}
                    style={[
                      styles.currencyOption,
                      {
                        backgroundColor: isSelected ? colors.primaryLight : colors.card,
                        borderColor: isSelected ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <View style={styles.currencyOptionLeft}>
                      <AppText style={styles.currencyFlag}>
                        {CURRENCY_FLAGS[curr] || '🌐'}
                      </AppText>
                      <View>
                        <AppText
                          variant="md"
                          weight={isSelected ? 'bold' : 'medium'}
                          color={isSelected ? 'brand' : 'primary'}
                        >
                          {CURRENCY_NAMES[curr] || curr}
                        </AppText>
                        <AppText variant="xs" color="secondary">
                          {curr}
                        </AppText>
                      </View>
                    </View>
                    <View style={styles.currencyOptionRight}>
                      <AppText
                        variant="md"
                        weight="bold"
                        color={isSelected ? 'brand' : 'secondary'}
                      >
                        {CURRENCY_SYMBOLS[curr]}
                      </AppText>
                      {isSelected && (
                        <View style={{ marginLeft: 6 }}>
                          <Icon name="Check" size={18} color={colors.primary} />
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <TouchableOpacity
              onPress={() => setShowCurrencyModal(false)}
              style={[styles.closeModalBtn, { borderTopWidth: 1, borderTopColor: colors.border }]}
            >
              <AppText variant="sm" weight="bold" color="secondary">
                Cancel
              </AppText>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Sign Out Confirmation Modal */}
      <ConfirmationModal
        visible={showSignOutModal}
        title="Sign Out of WealthFlow?"
        message="Are you sure you want to sign out? Your cloud data will remain safely stored on Supabase."
        confirmLabel="Sign Out"
        cancelLabel="Cancel"
        onConfirm={handleConfirmSignOut}
        onCancel={() => setShowSignOutModal(false)}
      />

      {/* Delete Account Modal */}
      <ConfirmationModal
        visible={showDeleteAccountModal}
        title="Delete Account Permanently?"
        message="This action is permanent and cannot be undone. All your transactions, budgets, savings goals, and account data will be permanently deleted from WealthFlow."
        confirmLabel="Delete Account"
        cancelLabel="Cancel"
        isDanger
        loading={isDeletingAccount}
        disabled={isDeletingAccount}
        onConfirm={handleConfirmDeleteAccount}
        onCancel={() => {
          if (!isDeletingAccount) {
            setShowDeleteAccountModal(false);
          }
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollContent: { padding: SPACING.md },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    marginBottom: SPACING.lg,
    gap: SPACING.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileDetails: { flex: 1 },
  proBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
    marginTop: 4,
  },
  editBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: { marginBottom: SPACING.lg },
  sectionHeader: { marginBottom: SPACING.xs, marginLeft: SPACING.xs, letterSpacing: 0.5 },
  settingCard: { borderRadius: RADIUS.xl, padding: SPACING.md, borderWidth: 1 },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: SPACING.xs + 2 },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, flex: 1 },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  iconWrapper: { width: 40, height: 40, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center' },
  divider: { height: 1, marginVertical: SPACING.sm },
  appFooter: { marginTop: SPACING.md, marginBottom: SPACING.xxl, alignItems: 'center' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalCard: { width: '100%', maxWidth: 360, borderRadius: RADIUS.xl, padding: SPACING.lg, gap: SPACING.sm, borderWidth: 1 },
  currencyModalCard: {
    width: '100%',
    maxWidth: 380,
    maxHeight: '80%',
    padding: 0,
    overflow: 'hidden',
  },
  currencyModalHeader: {
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
  },
  currencyScrollView: {
    maxHeight: 360,
    width: '100%',
  },
  currencyScrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  modalBtnRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
  currencyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
  },
  currencyOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  currencyFlag: {
    fontSize: 22,
  },
  currencyOptionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  closeModalBtn: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
});
