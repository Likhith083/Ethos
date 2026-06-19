import {
  appendQuotes,
  consumeNextQuote,
  hydrateQuoteCache,
  peekNextQuote,
  prependQuote,
  runPrefetch,
  shouldPrefetch,
} from './cache';
import { isValidQuote } from './isValidQuote';
import type { Quote } from './types';
import { fetchQuoteBatch, fetchRandomQuote } from './zenquotes';

/** Offline fallbacks when the network or API is unavailable. */
const FALLBACK_QUOTES: Quote[] = [
  {
    id: 'fallback-1',
    text: 'The obstacle is the way.',
    author: 'Marcus Aurelius',
  },
  {
    id: 'fallback-2',
    text: 'We suffer more often in imagination than in reality.',
    author: 'Seneca',
  },
  {
    id: 'fallback-3',
    text: 'No man is free who is not master of himself.',
    author: 'Epictetus',
  },
];

export type QuotesProvider = {
  initialize: () => Promise<Quote>;
  getNext: () => Promise<Quote>;
  prefetchIfNeeded: () => Promise<void>;
};

async function ensureSeedQuotes(): Promise<Quote> {
  const cached = await hydrateQuoteCache();
  if (cached) {
    return cached;
  }

  try {
    const batch = await fetchQuoteBatch();
    await appendQuotes(batch);
    const first = consumeNextQuote();
    if (first) {
      return first;
    }
  } catch {
    // Fall through to bundled quotes when offline or rate-limited.
  }

  await appendQuotes(FALLBACK_QUOTES);
  const fallback = consumeNextQuote();
  if (!fallback) {
    throw new Error('Unable to initialize quote cache');
  }
  return fallback;
}

export const quotesProvider: QuotesProvider = {
  async initialize() {
    return ensureSeedQuotes();
  },

  async getNext() {
    const next = consumeNextQuote();
    if (isValidQuote(next)) {
      void this.prefetchIfNeeded();
      return next;
    }

    try {
      const random = await fetchRandomQuote();
      if (isValidQuote(random)) {
        void this.prefetchIfNeeded();
        return random;
      }
    } catch {
      // Fall through to bundled quotes.
    }

    const fallback = FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)];
    void this.prefetchIfNeeded();
    return fallback;
  },

  async prefetchIfNeeded() {
    if (!shouldPrefetch()) {
      return;
    }

    try {
      await runPrefetch(fetchQuoteBatch);
    } catch {
      // Silent prefetch — keeps swiping uninterrupted.
    }
  },
};

/** Puts a quote back at the front of the queue when navigating backward. */
export async function restoreCurrentQuote(quote: Quote): Promise<void> {
  await prependQuote(quote);
}

/** Resolves the next quote body for scheduled notifications. */
export async function getNotificationQuote(): Promise<Quote> {
  const peeked = peekNextQuote();
  if (peeked) {
    return peeked;
  }

  try {
    return await fetchRandomQuote();
  } catch {
    return FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)];
  }
}
