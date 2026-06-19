import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Quote } from './types';

const STORAGE_KEY = 'ethos.quote.cache.v1';

/** Refill the queue when it drops below this count. */
const LOW_WATERMARK = 15;

type CachePayload = {
  quotes: Quote[];
  updatedAt: number;
};

let memoryQueue: Quote[] = [];
let prefetchPromise: Promise<void> | null = null;

async function readStorage(): Promise<CachePayload | null> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as CachePayload;
  } catch {
    return null;
  }
}

async function writeStorage(quotes: Quote[]): Promise<void> {
  const payload: CachePayload = {
    quotes,
    updatedAt: Date.now(),
  };
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export async function hydrateQuoteCache(): Promise<Quote | null> {
  const stored = await readStorage();
  if (!stored?.quotes.length) {
    return null;
  }

  memoryQueue = [...stored.quotes];
  return memoryQueue.shift() ?? null;
}

export function peekNextQuote(): Quote | null {
  return memoryQueue[0] ?? null;
}

export function consumeNextQuote(): Quote | null {
  const next = memoryQueue.shift() ?? null;
  if (next) {
    void writeStorage(memoryQueue);
  }
  return next;
}

export async function prependQuote(quote: Quote): Promise<void> {
  memoryQueue.unshift(quote);
  await writeStorage(memoryQueue);
}

export async function appendQuotes(quotes: Quote[]): Promise<void> {
  if (!quotes.length) {
    return;
  }

  memoryQueue.push(...quotes);
  await writeStorage(memoryQueue);
}

export function shouldPrefetch(): boolean {
  return memoryQueue.length < LOW_WATERMARK;
}

export async function runPrefetch(fetchBatch: () => Promise<Quote[]>): Promise<void> {
  if (!shouldPrefetch()) {
    return;
  }

  if (prefetchPromise) {
    await prefetchPromise;
    return;
  }

  prefetchPromise = (async () => {
    const quotes = await fetchBatch();
    await appendQuotes(quotes);
  })();

  try {
    await prefetchPromise;
  } finally {
    prefetchPromise = null;
  }
}
