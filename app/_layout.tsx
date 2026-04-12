import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { TermsConsent } from '@/components/TermsConsent';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <TermsConsent />
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="arcade" options={{ headerShown: false }} />
          <Stack.Screen name="stack-game" options={{ headerShown: false }} />
          <Stack.Screen name="2048" options={{ headerShown: false }} />

          <Stack.Screen name="neon-fly" options={{ headerShown: false }} />
          <Stack.Screen name="tap-frenzy" options={{ headerShown: false }} />
          <Stack.Screen name="whack-a-glow" options={{ headerShown: false }} />
          <Stack.Screen name="color-reflex" options={{ headerShown: false }} />
          <Stack.Screen name="simon-glow" options={{ headerShown: false }} />
          <Stack.Screen name="tap-sequence" options={{ headerShown: false }} />
          <Stack.Screen name="pattern-lock" options={{ headerShown: false }} />
          <Stack.Screen name="patches" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
