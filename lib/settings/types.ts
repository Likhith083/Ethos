import type { QuoteThemeId } from '@/theme/presets';

export type AppearanceMode = 'light' | 'dark' | 'auto';

export type AccentId = 'default' | 'ochre' | 'sage' | 'slate' | 'rose';

export type FontId = 'playfair' | 'inter' | 'lora' | 'crimson';

export type FontSizeId = 'small' | 'medium' | 'large';

export type TextAlignId = 'center' | 'left';

export type CardStyleId = 'flat' | 'soft';

export type AppSettings = {
  appearanceMode: AppearanceMode;
  themeId: QuoteThemeId;
  accentId: AccentId;
  fontId: FontId;
  fontSize: FontSizeId;
  textAlign: TextAlignId;
  cardStyle: CardStyleId;
};

export const DEFAULT_APP_SETTINGS: AppSettings = {
  appearanceMode: 'auto',
  themeId: 'midnight',
  accentId: 'default',
  fontId: 'playfair',
  fontSize: 'medium',
  textAlign: 'center',
  cardStyle: 'flat',
};
