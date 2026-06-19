import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import type { RefObject } from 'react';
import type { View } from 'react-native';

import { EXPORT_HEIGHT, EXPORT_WIDTH } from '@/lib/export/dimensions';

/** Allow layout/fonts to settle before capturing — avoids blank exports. */
function waitForNextFrame(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });
}

async function shareImageOnWeb(uri: string): Promise<void> {
  const response = await fetch(uri);
  const blob = await response.blob();
  const file = new File([blob], 'ethos-quote.png', { type: 'image/png' });

  if (typeof navigator !== 'undefined' && navigator.share && navigator.canShare?.({ files: [file] })) {
    await navigator.share({ files: [file], title: 'Ethos quote' });
    return;
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'ethos-quote.png';
  link.click();
  URL.revokeObjectURL(url);
}

export async function captureQuoteImage(exportRef: RefObject<View | null>): Promise<string> {
  if (!exportRef.current) {
    throw new Error('Export frame is not ready');
  }

  await waitForNextFrame();
  await waitForNextFrame();

  return captureRef(exportRef, {
    format: 'png',
    quality: 1,
    result: Platform.OS === 'web' ? 'data-uri' : 'tmpfile',
    width: EXPORT_WIDTH,
    height: EXPORT_HEIGHT,
  });
}

export async function captureAndShareQuoteImage(
  exportRef: RefObject<View | null>,
): Promise<void> {
  const uri = await captureQuoteImage(exportRef);

  if (Platform.OS === 'web') {
    await shareImageOnWeb(uri);
    return;
  }

  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    throw new Error('Sharing is not available on this device');
  }

  await Sharing.shareAsync(uri, {
    mimeType: 'image/png',
    UTI: 'public.png',
    dialogTitle: 'Share your quote',
  });
}
