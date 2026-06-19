import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { useAppSettings } from '@/components/AppSettingsProvider';
import { colors } from '@/theme/colors';

type ToastProps = {
  message: string;
  visible: boolean;
  onHide: () => void;
};

const TOAST_DURATION_MS = 1800;

export function Toast({ message, visible, onHide }: ToastProps) {
  const { isLightTheme } = useAppSettings();

  useEffect(() => {
    if (!visible) {
      return;
    }

    const timer = setTimeout(onHide, TOAST_DURATION_MS);
    return () => clearTimeout(timer);
  }, [onHide, visible]);

  if (!visible) {
    return null;
  }

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(200)}
      style={styles.container}
      pointerEvents="none"
    >
      <View
        style={[
          styles.toast,
          { backgroundColor: isLightTheme ? colors.primary : '#2C2C2E' },
        ]}
      >
        <Text style={styles.label}>{message}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 120,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 50,
  },
  toast: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 999,
  },
  label: {
    color: colors.foreground,
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
  },
});
