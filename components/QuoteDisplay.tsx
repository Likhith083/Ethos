import { StyleSheet, useWindowDimensions } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { QuoteCardContent } from '@/components/QuoteCardContent';
import { isValidQuote } from '@/lib/quotes/isValidQuote';
import type { Quote } from '@/lib/quotes/types';

type QuoteDisplayProps = {
  quote: Quote;
};

export function QuoteDisplay({ quote }: QuoteDisplayProps) {
  const { width: screenWidth } = useWindowDimensions();

  if (!isValidQuote(quote)) {
    return null;
  }

  return (
    <Animated.View entering={FadeIn.duration(320)} style={styles.wrapper}>
      <QuoteCardContent quote={quote} layoutWidth={screenWidth} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
