import React from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { paperTheme } from './src/theme/paperTheme';

const App = () => (
  <SafeAreaProvider>
    <PaperProvider theme={paperTheme}>
      <StatusBar
        translucent={false}
        barStyle="dark-content"
        backgroundColor={paperTheme.colors.background}
      />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <AppNavigator />
      </SafeAreaView>
    </PaperProvider>
  </SafeAreaProvider>
);

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
});

export default App;
