import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useAppSettings } from '@/components/AppSettingsProvider';
import { BottomSheet } from '@/components/BottomSheet';
import type {
  AccentId,
  AppearanceMode,
  CardStyleId,
  FontId,
  FontSizeId,
  TextAlignId,
} from '@/lib/settings/types';
import { colors } from '@/theme/colors';
import {
  accentColors,
  quoteThemePresets,
  type QuoteThemeId,
} from '@/theme/presets';

type CustomizeSheetProps = {
  visible: boolean;
  onClose: () => void;
};

const APPEARANCE_OPTIONS: { id: AppearanceMode; label: string }[] = [
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
  { id: 'auto', label: 'Auto' },
];

const FONT_OPTIONS: { id: FontId; label: string }[] = [
  { id: 'playfair', label: 'Playfair' },
  { id: 'inter', label: 'Inter' },
  { id: 'lora', label: 'Lora' },
  { id: 'crimson', label: 'Crimson' },
];

const SIZE_OPTIONS: { id: FontSizeId; label: string }[] = [
  { id: 'small', label: 'S' },
  { id: 'medium', label: 'M' },
  { id: 'large', label: 'L' },
];

const ALIGN_OPTIONS: { id: TextAlignId; label: string }[] = [
  { id: 'center', label: 'Center' },
  { id: 'left', label: 'Left' },
];

const CARD_OPTIONS: { id: CardStyleId; label: string }[] = [
  { id: 'flat', label: 'Flat' },
  { id: 'soft', label: 'Card' },
];

const ACCENT_OPTIONS: { id: AccentId; label: string }[] = [
  { id: 'default', label: 'Default' },
  { id: 'ochre', label: 'Ochre' },
  { id: 'sage', label: 'Sage' },
  { id: 'slate', label: 'Slate' },
  { id: 'rose', label: 'Rose' },
];

const THEME_IDS = Object.keys(quoteThemePresets) as QuoteThemeId[];

type SectionProps = {
  title: string;
  children: React.ReactNode;
  isLight: boolean;
};

function Section({ title, children, isLight }: SectionProps) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: isLight ? colors.muted : '#AEAEB2' }]}>
        {title}
      </Text>
      {children}
    </View>
  );
}

type ChipRowProps<T extends string> = {
  options: { id: T; label: string }[];
  value: T;
  onChange: (id: T) => void;
  isLight: boolean;
};

function ChipRow<T extends string>({ options, value, onChange, isLight }: ChipRowProps<T>) {
  return (
    <View style={styles.chipRow}>
      {options.map((option) => {
        const isActive = option.id === value;
        return (
          <Pressable
            key={option.id}
            style={[
              styles.chip,
              {
                backgroundColor: isActive
                  ? isLight
                    ? colors.primary
                    : '#3A3A3C'
                  : isLight
                    ? '#F2F2F7'
                    : '#2C2C2E',
              },
            ]}
            onPress={() => onChange(option.id)}
            accessibilityRole="button"
            accessibilityLabel={option.label}
            accessibilityState={{ selected: isActive }}
          >
            <Text
              style={[
                styles.chipLabel,
                { color: isActive ? colors.foreground : isLight ? colors.primary : '#D1D1D6' },
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function CustomizeSheet({ visible, onClose }: CustomizeSheetProps) {
  const { settings, updateSettings, isLightTheme } = useAppSettings();

  return (
    <BottomSheet visible={visible} title="Customize" onClose={onClose}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        bounces={false}
      >
        <Section title="Appearance" isLight={isLightTheme}>
          <ChipRow
            options={APPEARANCE_OPTIONS}
            value={settings.appearanceMode}
            onChange={(appearanceMode) => updateSettings({ appearanceMode })}
            isLight={isLightTheme}
          />
        </Section>

        <Section title="Theme" isLight={isLightTheme}>
          <View style={styles.themeRow}>
            {THEME_IDS.map((id) => {
              const preset = quoteThemePresets[id];
              const isActive = settings.themeId === id;
              return (
                <Pressable
                  key={id}
                  style={[
                    styles.themeChip,
                    {
                      borderColor: isActive
                        ? isLightTheme
                          ? colors.primary
                          : colors.foreground
                        : isLightTheme
                          ? colors.border
                          : colors.borderDark,
                    },
                  ]}
                  onPress={() => updateSettings({ themeId: id })}
                  accessibilityRole="button"
                  accessibilityLabel={`${preset.label} theme`}
                  accessibilityState={{ selected: isActive }}
                >
                  <View style={[styles.themeSwatch, { backgroundColor: preset.environment }]}>
                    <View style={[styles.themeDot, { backgroundColor: preset.quoteText }]} />
                  </View>
                  <Text
                    style={[
                      styles.themeLabel,
                      { color: isLightTheme ? colors.primary : colors.foreground },
                    ]}
                  >
                    {preset.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Section>

        <Section title="Accent" isLight={isLightTheme}>
          <View style={styles.accentRow}>
            {ACCENT_OPTIONS.map((option) => {
              const isActive = settings.accentId === option.id;
              const swatchColor =
                option.id === 'default'
                  ? quoteThemePresets[settings.themeId].authorText
                  : accentColors[option.id];
              return (
                <Pressable
                  key={option.id}
                  style={[
                    styles.accentChip,
                    isActive && {
                      borderColor: isLightTheme ? colors.primary : colors.foreground,
                      borderWidth: 2,
                    },
                  ]}
                  onPress={() => updateSettings({ accentId: option.id })}
                  accessibilityRole="button"
                  accessibilityLabel={`${option.label} accent`}
                  accessibilityState={{ selected: isActive }}
                >
                  <View style={[styles.accentSwatch, { backgroundColor: swatchColor }]} />
                </Pressable>
              );
            })}
          </View>
        </Section>

        <Section title="Font" isLight={isLightTheme}>
          <ChipRow
            options={FONT_OPTIONS}
            value={settings.fontId}
            onChange={(fontId) => updateSettings({ fontId })}
            isLight={isLightTheme}
          />
        </Section>

        <Section title="Size" isLight={isLightTheme}>
          <ChipRow
            options={SIZE_OPTIONS}
            value={settings.fontSize}
            onChange={(fontSize) => updateSettings({ fontSize })}
            isLight={isLightTheme}
          />
        </Section>

        <Section title="Alignment" isLight={isLightTheme}>
          <ChipRow
            options={ALIGN_OPTIONS}
            value={settings.textAlign}
            onChange={(textAlign) => updateSettings({ textAlign })}
            isLight={isLightTheme}
          />
        </Section>

        <Section title="Background" isLight={isLightTheme}>
          <ChipRow
            options={CARD_OPTIONS}
            value={settings.cardStyle}
            onChange={(cardStyle) => updateSettings({ cardStyle })}
            isLight={isLightTheme}
          />
        </Section>
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 8,
    gap: 20,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    minHeight: 40,
    justifyContent: 'center',
  },
  chipLabel: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
  },
  themeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  themeChip: {
    alignItems: 'center',
    gap: 6,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    width: '47%',
  },
  themeSwatch: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
  },
  themeLabel: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
  },
  accentRow: {
    flexDirection: 'row',
    gap: 10,
  },
  accentChip: {
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  accentSwatch: {
    width: 28,
    height: 28,
    borderRadius: 999,
  },
});
