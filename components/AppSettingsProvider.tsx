import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useColorScheme } from 'react-native';

import { loadAppSettings, saveAppSettings } from '@/lib/settings/storage';
import type { AppSettings } from '@/lib/settings/types';
import { DEFAULT_APP_SETTINGS } from '@/lib/settings/types';
import type { QuoteSurfaceColors } from '@/theme/colors';
import {
  getQuoteThemePreset,
  resolveAuthorColor,
  type QuoteThemePreset,
} from '@/theme/presets';

type AppSettingsContextValue = {
  settings: AppSettings;
  preset: QuoteThemePreset;
  surface: QuoteSurfaceColors;
  isLightTheme: boolean;
  updateSettings: (patch: Partial<AppSettings>) => void;
};

const AppSettingsContext = createContext<AppSettingsContextValue | null>(null);

function resolveStatusBarLight(
  settings: AppSettings,
  preset: QuoteThemePreset,
  systemScheme: 'light' | 'dark' | null,
): boolean {
  switch (settings.appearanceMode) {
    case 'light':
      return true;
    case 'dark':
      return false;
    case 'auto':
      if (systemScheme === 'light') {
        return true;
      }
      if (systemScheme === 'dark') {
        return false;
      }
      return preset.isLight;
    default: {
      const _exhaustive: never = settings.appearanceMode;
      return _exhaustive;
    }
  }
}

/**
 * Persists theme, typography, and layout preferences.
 * Resolves the active color surface from the selected preset + accent.
 */
export function AppSettingsProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_APP_SETTINGS);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    void (async () => {
      const stored = await loadAppSettings();
      setSettings(stored);
      setIsReady(true);
    })();
  }, []);

  const updateSettings = useCallback((patch: Partial<AppSettings>) => {
    setSettings((current) => {
      const next = { ...current, ...patch };
      void saveAppSettings(next);
      return next;
    });
  }, []);

  const preset = useMemo(() => getQuoteThemePreset(settings.themeId), [settings.themeId]);

  const surface = useMemo<QuoteSurfaceColors>(
    () => ({
      environment: preset.environment,
      quoteText: preset.quoteText,
      authorText: resolveAuthorColor(preset, settings.accentId),
      cardBackground: preset.cardBackground,
    }),
    [preset, settings.accentId],
  );

  const statusBarLight = resolveStatusBarLight(
    settings,
    preset,
    systemScheme === 'dark' ? 'dark' : systemScheme === 'light' ? 'light' : null,
  );

  const value = useMemo<AppSettingsContextValue>(
    () => ({
      settings,
      preset,
      surface,
      isLightTheme: statusBarLight,
      updateSettings,
    }),
    [preset, settings, statusBarLight, surface, updateSettings],
  );

  if (!isReady) {
    return null;
  }

  return <AppSettingsContext.Provider value={value}>{children}</AppSettingsContext.Provider>;
}

export function useAppSettings(): AppSettingsContextValue {
  const context = useContext(AppSettingsContext);
  if (!context) {
    throw new Error('useAppSettings must be used within AppSettingsProvider');
  }
  return context;
}
