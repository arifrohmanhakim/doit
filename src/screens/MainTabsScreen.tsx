import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { CommonActions } from '@react-navigation/native';
import { BottomNavigation, Icon, Text, useTheme } from 'react-native-paper';
import { CategoriesScreen } from './CategoriesScreen';
import { HomeScreen } from './HomeScreen';

type MainTabParamList = {
  Beranda: undefined;
  Kategori: undefined;
  Tabungan: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

const SavingsScreen = () => (
  <View style={styles.savingsContainer}>
    <Text variant="titleMedium">Fitur Tabungan segera hadir</Text>
  </View>
);

export const MainTabsScreen = () => {
  const theme = useTheme();

  const tabBarStyle = useMemo(
    () => [
      styles.bar,
      {
        backgroundColor: theme.colors.surface,
        borderTopColor: theme.colors.outline,
      },
    ],
    [theme.colors.outline, theme.colors.surface],
  );

  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false, animation: 'shift' }}
      // eslint-disable-next-line react/no-unstable-nested-components
      tabBar={({ navigation, state, descriptors, insets }) => (
        <BottomNavigation.Bar
          navigationState={state}
          safeAreaInsets={insets}
          onTabPress={({ route, preventDefault }) => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (event.defaultPrevented) {
              preventDefault();
              return;
            }

            navigation.dispatch({
              ...CommonActions.navigate(route.name, route.params),
              target: state.key,
            });
          }}
          renderIcon={({ route, focused, color }) =>
            descriptors[route.key].options.tabBarIcon?.({
              focused,
              color,
              size: 24,
            }) ?? null
          }
          getLabelText={({ route }) => {
            return descriptors[route.key].options.title ?? route.name;
          }}
          style={tabBarStyle}
          activeColor={theme.colors.primary}
          inactiveColor={theme.colors.onSurfaceVariant}
          activeIndicatorStyle={styles.activeIndicator}
        />
      )}
    >
      <Tab.Screen
        name="Beranda"
        component={HomeScreen}
        options={{
          // eslint-disable-next-line react/no-unstable-nested-components
          tabBarIcon: ({ color, focused, size }) => (
            <Icon
              source={focused ? 'home' : 'home-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Kategori"
        component={CategoriesScreen}
        options={{
          // eslint-disable-next-line react/no-unstable-nested-components
          tabBarIcon: ({ color, focused, size }) => (
            <Icon
              source={focused ? 'view-grid' : 'view-grid-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Tabungan"
        component={SavingsScreen}
        options={{
          // eslint-disable-next-line react/no-unstable-nested-components
          tabBarIcon: ({ color, focused, size }) => (
            <Icon
              source={focused ? 'bullseye-arrow' : 'bullseye-arrow'}
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  savingsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f6f6f6',
  },
  bar: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  activeIndicator: {
    borderRadius: 18,
  },
});
