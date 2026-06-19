import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppSettings } from '@/components/AppSettingsProvider';
import { CustomizeSheet } from '@/components/CustomizeSheet';
import { NotificationSettingsSheet } from '@/components/NotificationSettingsSheet';
import { PrimaryButton } from '@/components/PrimaryButton';
import { QuoteActionsSheet } from '@/components/QuoteActionsSheet';
import { QuoteExportCanvas } from '@/components/QuoteExportCanvas';
import { QuoteSurfaceBackground } from '@/components/QuoteSurfaceBackground';
import { SwipeableQuoteArea } from '@/components/SwipeableQuoteArea';
import { Toast } from '@/components/Toast';
import { useQuoteSession } from '@/hooks/useQuoteSession';
import { captureAndShareQuoteImage } from '@/lib/export/captureQuote';
import { EXPORT_WIDTH } from '@/lib/export/dimensions';
import { formatQuotePlainText } from '@/lib/quotes/formatQuote';
import { isValidQuote } from '@/lib/quotes/isValidQuote';

/** Renders off-screen so view-shot can capture without blocking the UI. */
const EXPORT_OFFSCREEN_OFFSET = EXPORT_WIDTH + 100;

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { surface, isLightTheme } = useAppSettings();
  const { quote, isLoading, isTransitioning, initialize, handlePanEnd } = useQuoteSession();

  const exportRef = useRef<View>(null);

  const [actionsVisible, setActionsVisible] = useState(false);
  const [customizeVisible, setCustomizeVisible] = useState(false);
  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    setToastVisible(true);
  }, []);

  const handleShare = useCallback(async () => {
    if (!isValidQuote(quote) || isSharing) {
      return;
    }

    setIsSharing(true);
    try {
      await captureAndShareQuoteImage(exportRef);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      Alert.alert('Share failed', 'Unable to share this quote image.');
    } finally {
      setIsSharing(false);
      setActionsVisible(false);
    }
  }, [isSharing, quote]);

  const handleCopy = useCallback(async () => {
    if (!isValidQuote(quote)) {
      return;
    }

    await Clipboard.setStringAsync(formatQuotePlainText(quote));
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setActionsVisible(false);
    showToast('Copied');
  }, [quote, showToast]);

  if (isLoading) {
    return (
      <QuoteSurfaceBackground surface={surface} style={styles.root}>
        <StatusBar style={isLightTheme ? 'dark' : 'light'} />
        <View style={styles.centered}>
          <ActivityIndicator color={surface.quoteText} size="large" />
        </View>
      </QuoteSurfaceBackground>
    );
  }

  if (!isValidQuote(quote)) {
    return (
      <QuoteSurfaceBackground surface={surface} style={styles.root}>
        <StatusBar style={isLightTheme ? 'dark' : 'light'} />
        <View style={styles.centered}>
          <Text style={[styles.errorText, { color: surface.authorText }]}>
            Unable to load quote
          </Text>
          <PrimaryButton label="Try again" onPress={() => void initialize()} />
        </View>
      </QuoteSurfaceBackground>
    );
  }

  return (
    <QuoteSurfaceBackground surface={surface} style={styles.root}>
      <StatusBar style={isLightTheme ? 'dark' : 'light'} />

      <View
        style={[
          styles.screen,
          {
            paddingTop: insets.top + 16,
            paddingBottom: insets.bottom + 16,
            paddingHorizontal: Math.max(insets.left, insets.right, 24),
          },
        ]}
      >
        <Text
          style={[styles.header, { color: surface.authorText }]}
          accessibilityRole="header"
          pointerEvents="none"
        >
          Ethos
        </Text>

        <SwipeableQuoteArea
          quote={quote}
          onPanEnd={handlePanEnd}
          onTap={() => setActionsVisible(true)}
        />

        {isTransitioning ? (
          <View style={styles.loadingOverlay} pointerEvents="none">
            <ActivityIndicator color={surface.authorText} size="small" />
          </View>
        ) : null}
      </View>

      <QuoteActionsSheet
        visible={actionsVisible}
        onClose={() => setActionsVisible(false)}
        onShare={() => void handleShare()}
        onCopy={() => void handleCopy()}
        onCustomize={() => {
          setActionsVisible(false);
          setCustomizeVisible(true);
        }}
        onNotifications={() => {
          setActionsVisible(false);
          setNotificationsVisible(true);
        }}
      />

      <CustomizeSheet visible={customizeVisible} onClose={() => setCustomizeVisible(false)} />
      <NotificationSettingsSheet
        visible={notificationsVisible}
        onClose={() => setNotificationsVisible(false)}
      />

      <Toast
        message={toastMessage}
        visible={toastVisible}
        onHide={() => setToastVisible(false)}
      />

      <View style={styles.exportHost} pointerEvents="none">
        <QuoteExportCanvas ref={exportRef} quote={quote} />
      </View>

      {isSharing ? (
        <View style={styles.sharingOverlay}>
          <ActivityIndicator color={surface.quoteText} size="large" />
        </View>
      ) : null}
    </QuoteSurfaceBackground>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  screen: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 16,
  },
  header: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    letterSpacing: 4,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: 8,
  },
  loadingOverlay: {
    position: 'absolute',
    bottom: 32,
    alignSelf: 'center',
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    marginBottom: 8,
    textAlign: 'center',
  },
  exportHost: {
    position: 'absolute',
    left: -EXPORT_OFFSCREEN_OFFSET,
    top: 0,
  },
  sharingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    zIndex: 200,
  },
});
