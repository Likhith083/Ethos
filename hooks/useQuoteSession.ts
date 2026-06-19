import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';

import type { PanEndEvent } from '@/components/SwipeableQuoteArea';
import { isValidQuote } from '@/lib/quotes/isValidQuote';
import type { Quote } from '@/lib/quotes/types';
import { quotesProvider, restoreCurrentQuote } from '@/lib/quotes/provider';
import { SWIPE_DISTANCE, SWIPE_VELOCITY } from '@/theme/gestures';

/**
 * Manages the active quote, swipe navigation, and in-session history stack.
 * History is memory-only — swiping back restores quotes seen during this session.
 */
export function useQuoteSession() {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const quoteRef = useRef<Quote | null>(null);
  const historyRef = useRef<Quote[]>([]);
  const transitioningRef = useRef(false);

  useEffect(() => {
    quoteRef.current = quote;
  }, [quote]);

  const endTransition = useCallback(() => {
    transitioningRef.current = false;
    setIsTransitioning(false);
  }, []);

  const initialize = useCallback(async () => {
    setIsLoading(true);
    try {
      const initial = await quotesProvider.initialize();
      historyRef.current = [];
      setQuote(initial);
      void quotesProvider.prefetchIfNeeded();
    } catch {
      Alert.alert('Quote unavailable', 'Could not load a quote. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void initialize();
  }, [initialize]);

  const goToNextQuote = useCallback(async () => {
    if (transitioningRef.current) {
      return;
    }

    const current = quoteRef.current;
    if (!isValidQuote(current)) {
      return;
    }

    transitioningRef.current = true;
    setIsTransitioning(true);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const next = await quotesProvider.getNext();
      if (!isValidQuote(next)) {
        throw new Error('Invalid quote');
      }

      historyRef.current = [...historyRef.current, current];
      setQuote(next);
    } catch {
      Alert.alert('Quote unavailable', 'Could not load the next quote. Try again in a moment.');
    } finally {
      endTransition();
    }
  }, [endTransition]);

  const goToPreviousQuote = useCallback(() => {
    if (transitioningRef.current || historyRef.current.length === 0) {
      return;
    }

    const current = quoteRef.current;
    if (!isValidQuote(current)) {
      return;
    }

    transitioningRef.current = true;
    setIsTransitioning(true);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const updatedHistory = [...historyRef.current];
    const previous = updatedHistory.pop();
    if (!isValidQuote(previous)) {
      endTransition();
      return;
    }

    historyRef.current = updatedHistory;
    setQuote(previous);
    void restoreCurrentQuote(current);
    endTransition();
  }, [endTransition]);

  const handlePanEnd = useCallback(
    ({ translationX, velocityX }: PanEndEvent) => {
      const swipedNext =
        translationX <= -SWIPE_DISTANCE || velocityX <= -SWIPE_VELOCITY;
      const swipedPrevious =
        translationX >= SWIPE_DISTANCE || velocityX >= SWIPE_VELOCITY;

      if (swipedNext) {
        void goToNextQuote();
        return;
      }

      if (swipedPrevious && historyRef.current.length > 0) {
        goToPreviousQuote();
      }
    },
    [goToNextQuote, goToPreviousQuote],
  );

  return {
    quote,
    isLoading,
    isTransitioning,
    initialize,
    handlePanEnd,
  };
}
