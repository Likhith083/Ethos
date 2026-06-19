import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { useAppSettings } from '@/components/AppSettingsProvider';
import { colors } from '@/theme/colors';

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
};

export function PrimaryButton({ label, onPress, disabled, loading }: PrimaryButtonProps) {
  const { surface, isLightTheme } = useAppSettings();
  const isDisabled = disabled || loading;

  const backgroundColor = isLightTheme ? colors.primary : surface.quoteText;
  const textColor = isLightTheme ? colors.primaryText : surface.environment;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        { backgroundColor, opacity: isDisabled ? 0.5 : pressed ? 0.88 : 1 },
      ]}
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled }}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={[styles.label, { color: textColor }]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    minHeight: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  label: {
    fontSize: 17,
    fontFamily: 'Inter_500Medium',
    letterSpacing: 0.2,
  },
});
