import type { AccentId } from '@/lib/settings/types';

/** Curated full-bleed themes — readability first, no gradients. */
export const quoteThemePresets = {
  paper: {
    id: 'paper' as const,
    label: 'Paper',
    environment: '#F7F6F2',
    quoteText: '#1A1A1A',
    authorText: '#5C5C5C',
    cardBackground: '#FFFFFF',
    isLight: true,
  },
  midnight: {
    id: 'midnight' as const,
    label: 'Midnight',
    environment: '#0F1115',
    quoteText: '#F5F5F7',
    authorText: '#A1A1AA',
    cardBackground: '#1A1D24',
    isLight: false,
  },
  warm: {
    id: 'warm' as const,
    label: 'Warm',
    environment: '#F3EDE4',
    quoteText: '#2C2419',
    authorText: '#6B5E4F',
    cardBackground: '#FAF6F0',
    isLight: true,
  },
  mono: {
    id: 'mono' as const,
    label: 'Mono',
    environment: '#000000',
    quoteText: '#FFFFFF',
    authorText: '#A3A3A3',
    cardBackground: '#111111',
    isLight: false,
  },
} as const;

export type QuoteThemeId = keyof typeof quoteThemePresets;

export type QuoteThemePreset = (typeof quoteThemePresets)[QuoteThemeId];

export const DEFAULT_QUOTE_THEME_ID: QuoteThemeId = 'midnight';

export const accentColors: Record<AccentId, string> = {
  default: 'transparent',
  ochre: '#C4A574',
  sage: '#7A9E7E',
  slate: '#6B7B8C',
  rose: '#B87A7A',
};

export function getQuoteThemePreset(id: QuoteThemeId): QuoteThemePreset {
  return quoteThemePresets[id];
}

export function resolveAuthorColor(preset: QuoteThemePreset, accentId: AccentId): string {
  if (accentId === 'default') {
    return preset.authorText;
  }
  return accentColors[accentId];
}
