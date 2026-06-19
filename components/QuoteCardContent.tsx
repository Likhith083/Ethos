import { Platform, StyleSheet, Text, View } from 'react-native';

import { useAppSettings } from '@/components/AppSettingsProvider';
import { isValidQuote } from '@/lib/quotes/isValidQuote';
import type { Quote } from '@/lib/quotes/types';
import { getQuoteTypography } from '@/theme/typography';

type QuoteCardContentProps = {
  quote: Quote;
  layoutWidth: number;
};

const CONTENT_WIDTH_RATIO = 0.86;
const HORIZONTAL_GUTTER = 24;

export function QuoteCardContent({ quote, layoutWidth }: QuoteCardContentProps) {
  const { settings, surface } = useAppSettings();

  if (!isValidQuote(quote)) {
    return null;
  }

  const contentWidth = Math.min(
    layoutWidth * CONTENT_WIDTH_RATIO,
    layoutWidth - HORIZONTAL_GUTTER * 2,
  );
  const typography = getQuoteTypography(
    settings.fontId,
    settings.fontSize,
    quote.text.length,
    layoutWidth,
  );
  const textAlign = settings.textAlign;
  const useCard = settings.cardStyle === 'soft';

  return (
    <View
      style={[
        styles.content,
        { width: contentWidth },
        useCard && {
          backgroundColor: surface.cardBackground,
          borderRadius: layoutWidth >= 800 ? 32 : 16,
          paddingHorizontal: layoutWidth >= 800 ? 48 : 24,
          paddingVertical: layoutWidth >= 800 ? 64 : 32,
        },
      ]}
    >
      <Text
        style={[
          styles.quote,
          typography.quote,
          { color: surface.quoteText, textAlign },
        ]}
        textBreakStrategy="simple"
        {...Platform.select({
          ios: layoutWidth < 800
            ? {
                adjustsFontSizeToFit: true,
                minimumFontScale: 0.9,
                numberOfLines: 14,
              }
            : {},
          default: {},
        })}
      >
        {`"${quote.text}"`}
      </Text>
      <Text
        style={[
          styles.author,
          typography.author,
          {
            color: surface.authorText,
            textAlign,
            marginTop: layoutWidth >= 800 ? 48 : 28,
          },
        ]}
        textBreakStrategy="simple"
      >
        — {quote.author}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    alignItems: 'stretch',
  },
  quote: {
    width: '100%',
  },
  author: {
    width: '100%',
    textTransform: 'uppercase',
  },
});
