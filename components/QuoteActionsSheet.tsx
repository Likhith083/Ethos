import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppSettings } from '@/components/AppSettingsProvider';
import { BottomSheet } from '@/components/BottomSheet';
import { colors } from '@/theme/colors';

type QuoteActionsSheetProps = {
  visible: boolean;
  onClose: () => void;
  onShare: () => void;
  onCopy: () => void;
  onCustomize: () => void;
  onNotifications: () => void;
};

type ActionItem = {
  id: string;
  label: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
};

export function QuoteActionsSheet({
  visible,
  onClose,
  onShare,
  onCopy,
  onCustomize,
  onNotifications,
}: QuoteActionsSheetProps) {
  const { isLightTheme } = useAppSettings();

  const labelColor = isLightTheme ? colors.primary : colors.foreground;
  const mutedColor = isLightTheme ? colors.muted : '#AEAEB2';
  const rowBackground = isLightTheme ? '#F2F2F7' : '#2C2C2E';

  const actions: ActionItem[] = [
    {
      id: 'share',
      label: 'Share',
      subtitle: 'Styled quote image',
      icon: 'share-outline',
      onPress: onShare,
    },
    {
      id: 'copy',
      label: 'Copy',
      subtitle: 'Plain text',
      icon: 'copy-outline',
      onPress: onCopy,
    },
    {
      id: 'customize',
      label: 'Customize',
      subtitle: 'Theme, font, and layout',
      icon: 'color-palette-outline',
      onPress: onCustomize,
    },
    {
      id: 'notifications',
      label: 'Reminders',
      subtitle: 'Daily quote notifications',
      icon: 'notifications-outline',
      onPress: onNotifications,
    },
  ];

  return (
    <BottomSheet visible={visible} title="Quote" onClose={onClose}>
      <View style={styles.list}>
        {actions.map((action) => (
          <Pressable
            key={action.id}
            style={({ pressed }) => [
              styles.row,
              { backgroundColor: rowBackground, opacity: pressed ? 0.75 : 1 },
            ]}
            onPress={action.onPress}
            accessibilityRole="button"
            accessibilityLabel={action.label}
            accessibilityHint={action.subtitle}
          >
            <Ionicons name={action.icon} size={22} color={labelColor} />
            <View style={styles.copy}>
              <Text style={[styles.label, { color: labelColor }]}>{action.label}</Text>
              <Text style={[styles.subtitle, { color: mutedColor }]}>{action.subtitle}</Text>
            </View>
          </Pressable>
        ))}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    minHeight: 56,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
  },
  subtitle: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
  },
});
