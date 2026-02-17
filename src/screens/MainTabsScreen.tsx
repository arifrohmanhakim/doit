import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { BottomNavigation, Text } from 'react-native-paper';
import { CategoriesScreen } from './CategoriesScreen';
import { HomeScreen } from './HomeScreen';

const SavingsScreen = () => (
  <View style={styles.savingsContainer}>
    <Text variant="titleMedium">Fitur Tabungan segera hadir</Text>
  </View>
);

export const MainTabsScreen = () => {
  const [index, setIndex] = useState(0);
  const routes = useMemo(
    () => [
      { key: 'home', title: 'Beranda', focusedIcon: 'home', unfocusedIcon: 'home-outline' },
      {
        key: 'categories',
        title: 'Kategori',
        focusedIcon: 'view-grid',
        unfocusedIcon: 'view-grid-outline',
      },
      {
        key: 'savings',
        title: 'Tabungan',
        focusedIcon: 'piggy-bank',
        unfocusedIcon: 'piggy-bank-outline',
      },
    ],
    [],
  );

  const renderScene = BottomNavigation.SceneMap({
    home: HomeScreen,
    categories: CategoriesScreen,
    savings: SavingsScreen,
  });

  return (
    <BottomNavigation
      navigationState={{ index, routes }}
      onIndexChange={setIndex}
      renderScene={renderScene}
      labeled
      compact={false}
      shifting={false}
      sceneAnimationEnabled
      sceneAnimationType="opacity"
      barStyle={styles.bar}
      activeColor="#0da837"
      inactiveColor="#8b9ab3"
    />
  );
};

const styles = StyleSheet.create({
  savingsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f6f6f6',
  },
  bar: { backgroundColor: '#ffffff' },
});
