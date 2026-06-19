import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppSettings } from '@/components/AppSettingsProvider';
import { colors } from '@/theme/colors';
import { springConfig } from '@/theme/motion';

type BottomSheetProps = {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
};

export function BottomSheet({ visible, title, onClose, children, contentStyle }: BottomSheetProps) {
  const insets = useSafeAreaInsets();
  const { isLightTheme } = useAppSettings();
  const translateY = useSharedValue(400);
  const backdropOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withTiming(0, springConfig.sheet.open);
      backdropOpacity.value = withTiming(1, { duration: 220 });
      return;
    }

    translateY.value = withTiming(400, springConfig.sheet.close);
    backdropOpacity.value = withTiming(0, { duration: 180 });
  }, [backdropOpacity, translateY, visible]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const sheetBackground = isLightTheme ? colors.sheet : colors.sheetDark;
  const titleColor = isLightTheme ? colors.primary : colors.foreground;
  const handleColor = isLightTheme ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.2)';

  if (!visible) {
    return null;
  }

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Close"
      >
        <Animated.View style={[styles.backdrop, backdropStyle]} />
      </Pressable>

      <Animated.View
        style={[
          styles.sheet,
          sheetStyle,
          {
            backgroundColor: sheetBackground,
            paddingBottom: insets.bottom + 20,
          },
        ]}
      >
        <View style={[styles.handle, { backgroundColor: handleColor }]} />
        <Text style={[styles.title, { color: titleColor }]} accessibilityRole="header">
          {title}
        </Text>
        <View style={[styles.content, contentStyle]}>{children}</View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    zIndex: 100,
    elevation: 100,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
  },
  sheet: {
    width: '100%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 24,
    paddingTop: 12,
    maxHeight: '85%',
    zIndex: 2,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 999,
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter_500Medium',
    marginBottom: 20,
  },
  content: {
    gap: 20,
  },
});
