import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import type { QuoteSurfaceColors } from '@/theme/colors';

type QuoteSurfaceBackgroundProps = {
  surface: QuoteSurfaceColors;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
};

export function QuoteSurfaceBackground({
  surface,
  style,
  children,
}: QuoteSurfaceBackgroundProps) {
  return (
    <View style={[styles.fill, style, { backgroundColor: surface.environment }]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
});
