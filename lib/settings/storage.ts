import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  DEFAULT_APP_SETTINGS,
  type AccentId,
  type AppearanceMode,
  type AppSettings,
  type CardStyleId,
  type FontId,
  type FontSizeId,
  type TextAlignId,
} from '@/lib/settings/types';
import type { QuoteThemeId } from '@/theme/presets';

const STORAGE_KEY = 'ethos.app.settings.v2';

const APPEARANCE_MODES: AppearanceMode[] = ['light', 'dark', 'auto'];
const THEME_IDS: QuoteThemeId[] = ['paper', 'midnight', 'warm', 'mono'];
const ACCENT_IDS: AccentId[] = ['default', 'ochre', 'sage', 'slate', 'rose'];
const FONT_IDS: FontId[] = ['playfair', 'inter', 'lora', 'crimson'];
const FONT_SIZES: FontSizeId[] = ['small', 'medium', 'large'];
const TEXT_ALIGNS: TextAlignId[] = ['center', 'left'];
const CARD_STYLES: CardStyleId[] = ['flat', 'soft'];

function isOneOf<T extends string>(value: unknown, options: readonly T[]): value is T {
  return typeof value === 'string' && options.includes(value as T);
}

export async function loadAppSettings(): Promise<AppSettings> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return DEFAULT_APP_SETTINGS;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    return {
      appearanceMode: isOneOf(parsed.appearanceMode, APPEARANCE_MODES)
        ? parsed.appearanceMode
        : DEFAULT_APP_SETTINGS.appearanceMode,
      themeId: isOneOf(parsed.themeId, THEME_IDS) ? parsed.themeId : DEFAULT_APP_SETTINGS.themeId,
      accentId: isOneOf(parsed.accentId, ACCENT_IDS) ? parsed.accentId : DEFAULT_APP_SETTINGS.accentId,
      fontId: isOneOf(parsed.fontId, FONT_IDS) ? parsed.fontId : DEFAULT_APP_SETTINGS.fontId,
      fontSize: isOneOf(parsed.fontSize, FONT_SIZES) ? parsed.fontSize : DEFAULT_APP_SETTINGS.fontSize,
      textAlign: isOneOf(parsed.textAlign, TEXT_ALIGNS) ? parsed.textAlign : DEFAULT_APP_SETTINGS.textAlign,
      cardStyle: isOneOf(parsed.cardStyle, CARD_STYLES) ? parsed.cardStyle : DEFAULT_APP_SETTINGS.cardStyle,
    };
  } catch {
    return DEFAULT_APP_SETTINGS;
  }
}

export async function saveAppSettings(settings: AppSettings): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}
