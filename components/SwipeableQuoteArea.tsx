import { useCallback } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import { QuoteDisplay } from '@/components/QuoteDisplay';
import type { Quote } from '@/lib/quotes/types';
import { springConfig } from '@/theme/motion';

export type PanEndEvent = {
  translationX: number;
  velocityX: number;
};

type SwipeableQuoteAreaProps = {
  quote: Quote;
  onPanEnd: (event: PanEndEvent) => void;
  onTap: () => void;
};

/**
 * Full-screen gesture layer: tap opens actions, horizontal swipe navigates quotes.
 * Swipe detection is finalized on the JS thread via onPanEnd.
 */
export function SwipeableQuoteArea({ quote, onPanEnd, onTap }: SwipeableQuoteAreaProps) {
  const { width } = useWindowDimensions();
  const translateX = useSharedValue(0);

  const handlePanEnd = useCallback(
    (translationX: number, velocityX: number) => {
      onPanEnd({ translationX, velocityX });
    },
    [onPanEnd],
  );

  const handleTap = useCallback(() => {
    onTap();
  }, [onTap]);

  const panGesture = Gesture.Pan()
    .activeOffsetX([-12, 12])
    .failOffsetY([-20, 20])
    .onUpdate((event) => {
      'worklet';
      translateX.value = event.translationX;
    })
    .onEnd((event) => {
      'worklet';
      translateX.value = withSpring(0, springConfig.quoteSwipe);
      runOnJS(handlePanEnd)(event.translationX, event.velocityX);
    });

  const tapGesture = Gesture.Tap().maxDistance(12).onEnd(() => {
    'worklet';
    runOnJS(handleTap)();
  });

  const composedGesture = Gesture.Exclusive(panGesture, tapGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: 1 - Math.min(Math.abs(translateX.value) / (width * 0.5), 0.25),
  }));

  return (
    <GestureDetector gesture={composedGesture}>
      <Animated.View
        style={[styles.area, animatedStyle]}
        accessibilityRole="button"
        accessibilityLabel={`Quote by ${quote.author}`}
        accessibilityHint="Tap for options. Swipe left for the next quote. Swipe right for the previous quote."
      >
        <View style={styles.center}>
          <QuoteDisplay quote={quote} key={quote.id} />
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  area: {
    flex: 1,
    width: '100%',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
