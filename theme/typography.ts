import type { FontId, FontSizeId } from '@/lib/settings/types';

export const fontFamilies: Record<FontId, string> = {
  playfair: 'PlayfairDisplay_600SemiBold',
  inter: 'Inter_400Regular',
  lora: 'Lora_400Regular',
  crimson: 'CrimsonText_400Regular',
};

const FONT_SIZE_SCALE: Record<FontSizeId, number> = {
  small: 0.88,
  medium: 1,
  large: 1.14,
};

export function getQuoteTypography(
  fontId: FontId,
  fontSize: FontSizeId,
  quoteLength: number,
  layoutWidth = 390,
) {
  const layoutScale = Math.min(Math.max(layoutWidth / 390, 0.88), 3.2);
  const scale = FONT_SIZE_SCALE[fontSize];
  const base =
    quoteLength <= 40 ? 34 : quoteLength <= 80 ? 30 : quoteLength <= 140 ? 26 : 22;

  const quoteFontSize = Math.round(base * scale * layoutScale);
  const authorFontSize = Math.max(13, Math.round(quoteFontSize * 0.38));

  return {
    quote: {
      fontFamily: fontFamilies[fontId],
      fontSize: quoteFontSize,
      lineHeight: Math.round(quoteFontSize * 1.45),
      letterSpacing: fontId === 'inter' ? -0.2 : 0,
    },
    author: {
      fontFamily: 'Inter_500Medium',
      fontSize: authorFontSize,
      lineHeight: Math.round(authorFontSize * 1.5),
      letterSpacing: 1.5,
    },
  };
}
