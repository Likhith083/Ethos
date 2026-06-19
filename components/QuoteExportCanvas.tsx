import { forwardRef } from 'react';
import { StyleSheet, View } from 'react-native';

import { QuoteCardContent } from '@/components/QuoteCardContent';
import { useAppSettings } from '@/components/AppSettingsProvider';
import { EXPORT_HEIGHT, EXPORT_WIDTH } from '@/lib/export/dimensions';
import type { Quote } from '@/lib/quotes/types';

type QuoteExportCanvasProps = {
  quote: Quote;
};

/** Off-screen canvas — matches on-screen theme for WYSIWYG share images. */
export const QuoteExportCanvas = forwardRef<View, QuoteExportCanvasProps>(
  function QuoteExportCanvas({ quote }, ref) {
    const { surface } = useAppSettings();

    return (
      <View
        ref={ref}
        collapsable={false}
        style={[styles.canvas, { backgroundColor: surface.environment }]}
      >
        <View style={styles.center}>
          <QuoteCardContent quote={quote} layoutWidth={EXPORT_WIDTH} />
        </View>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  canvas: {
    width: EXPORT_WIDTH,
    height: EXPORT_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  center: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 80,
  },
});
