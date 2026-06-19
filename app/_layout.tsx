import {
  CrimsonText_400Regular,
} from '@expo-google-fonts/crimson-text';
import {
  Inter_400Regular,
  Inter_500Medium,
} from '@expo-google-fonts/inter';
import {
  Lora_400Regular,
} from '@expo-google-fonts/lora';
import {
  PlayfairDisplay_600SemiBold,
  useFonts,
} from '@expo-google-fonts/playfair-display';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';

import { AppSettingsProvider } from '@/components/AppSettingsProvider';
import {
  configureNotifications,
  syncDailyQuoteNotification,
} from '@/lib/notifications/scheduler';
import { colors } from '@/theme/colors';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();

/** Root layout: fonts, settings provider, notification bootstrap. */
export default function RootLayout() {
  const [loaded, error] = useFonts({
    PlayfairDisplay_600SemiBold,
    Inter_400Regular,
    Inter_500Medium,
    Lora_400Regular,
    CrimsonText_400Regular,
  });

  useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    if (!loaded) {
      return;
    }

    void (async () => {
      await configureNotifications();
      await syncDailyQuoteNotification();
    })();
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <AppSettingsProvider>
        <GestureHandlerRootView style={styles.root}>
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.environment } }}>
            <Stack.Screen name="index" />
          </Stack>
        </GestureHandlerRootView>
      </AppSettingsProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.environment,
  },
});
