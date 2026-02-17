import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { enableScreens } from 'react-native-screens';
import { MainTabsScreen } from '../screens/MainTabsScreen';
import { TransactionsScreen } from '../screens/TransactionsScreen';

enableScreens(true);

export type RootStackParamList = {
  MainTabs: undefined;
  Transactions: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="MainTabs"
          component={MainTabsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Transactions"
          component={TransactionsScreen}
          options={{ title: 'Semua Transaksi' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
