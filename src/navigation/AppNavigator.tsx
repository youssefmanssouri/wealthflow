import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Icon } from '../components/ui/Icon';
import { AppText } from '../components/ui/AppText';

import { HomeScreen } from '../screens/HomeScreen';
import { TransactionsScreen } from '../screens/TransactionsScreen';
import { BudgetScreen } from '../screens/BudgetScreen';
import { AnalyticsScreen } from '../screens/AnalyticsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';

import { AddTransactionModal } from '../screens/AddTransactionModal';
import { TransactionDetailModal } from '../screens/TransactionDetailModal';
import { EditBudgetModal } from '../screens/EditBudgetModal';
import { AddSavingsGoalModal } from '../screens/AddSavingsGoalModal';
import { ContributeSavingsModal } from '../screens/ContributeSavingsModal';

import { AuthNavigator } from './AuthNavigator';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TabNavigator = () => {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.tabBarBorder,
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.tabActive,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => <Icon name="Home" size={size} color={color} />,
        }}
      />

      <Tab.Screen
        name="TransactionsTab"
        component={TransactionsScreen}
        options={{
          tabBarLabel: 'Transactions',
          tabBarIcon: ({ color, size }) => <Icon name="ArrowLeftRight" size={size} color={color} />,
        }}
      />

      <Tab.Screen
        name="BudgetTab"
        component={BudgetScreen}
        options={{
          tabBarLabel: 'Budget',
          tabBarIcon: ({ color, size }) => <Icon name="PieChart" size={size} color={color} />,
        }}
      />

      <Tab.Screen
        name="AnalyticsTab"
        component={AnalyticsScreen}
        options={{
          tabBarLabel: 'Analytics',
          tabBarIcon: ({ color, size }) => <Icon name="TrendingUp" size={size} color={color} />,
        }}
      />

      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => <Icon name="User" size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
};

const RootSplash = () => {
  const { colors } = useTheme();
  return (
    <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
      <View style={[styles.brandBadge, { backgroundColor: colors.primary + '20' }]}>
        <Icon name="TrendingUp" size={40} color={colors.primary} strokeWidth={2.5} />
      </View>
      <AppText variant="xxl" weight="bold" style={{ marginTop: 12 }}>
        WealthFlow
      </AppText>
      <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 24 }} />
    </View>
  );
};

export const AppNavigator = () => {
  const { colors } = useTheme();
  const { isInitializing, isAuthenticated } = useAuth();

  return (
    <NavigationContainer>
      {isInitializing ? (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="RootSplash" component={RootSplash} />
        </Stack.Navigator>
      ) : !isAuthenticated ? (
        <AuthNavigator />
      ) : (
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
          }}
        >
          <Stack.Screen name="MainTabs" component={TabNavigator} />
          <Stack.Screen
            name="AddTransaction"
            component={AddTransactionModal}
            options={{ presentation: 'modal' }}
          />
          <Stack.Screen
            name="TransactionDetail"
            component={TransactionDetailModal}
            options={{ presentation: 'card' }}
          />
          <Stack.Screen
            name="EditBudget"
            component={EditBudgetModal}
            options={{ presentation: 'modal' }}
          />
          <Stack.Screen
            name="AddSavingsGoal"
            component={AddSavingsGoalModal}
            options={{ presentation: 'modal' }}
          />
          <Stack.Screen
            name="ContributeSavings"
            component={ContributeSavingsModal}
            options={{ presentation: 'modal' }}
          />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandBadge: {
    width: 72,
    height: 72,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
