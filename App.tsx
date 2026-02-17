import React from 'react';
import { StatusBar } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { paperTheme } from './src/theme/paperTheme';

const App = () => (
  <SafeAreaProvider>
    <PaperProvider theme={paperTheme}>
      <StatusBar
        translucent
        barStyle="dark-content"
        backgroundColor="transparent"
      />
      <AppNavigator />
    </PaperProvider>
  </SafeAreaProvider>
);

export default App;
