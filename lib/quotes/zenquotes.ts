import Constants from 'expo-constants';

import type { Quote, ZenQuoteResponse } from './types';

const BASE_URL = 'https://zenquotes.io/api';
const MIN_REQUEST_INTERVAL_MS = 6500;

/** ZenQuotes free tier: 5 requests / 30 s. Throttle keeps swipes smooth. */
let lastRequestAt = 0;

function getApiKey(): string | undefined {
  return (
    process.env.EXPO_PUBLIC_ZENQUOTES_API_KEY ??
    (Constants.expoConfig?.extra?.zenquotesApiKey as string | undefined)
  );
}

function buildUrl(mode: 'quotes' | 'random'): string {
  const key = getApiKey();
  if (key) {
    return `${BASE_URL}/${mode}/${key}`;
  }
  return `${BASE_URL}/${mode}`;
}

async function throttleRequest(): Promise<void> {
  const elapsed = Date.now() - lastRequestAt;
  if (elapsed < MIN_REQUEST_INTERVAL_MS) {
    await new Promise((resolve) => setTimeout(resolve, MIN_REQUEST_INTERVAL_MS - elapsed));
  }
  lastRequestAt = Date.now();
}

function toQuote(item: ZenQuoteResponse, index: number): Quote {
  const seed = `${item.q}-${item.a}-${index}`;
  return {
    id: seed.replace(/\s+/g, '-').slice(0, 120),
    text: item.q.trim(),
    author: item.a.trim(),
  };
}

export async function fetchQuoteBatch(): Promise<Quote[]> {
  await throttleRequest();

  const response = await fetch(buildUrl('quotes'));
  if (!response.ok) {
    throw new Error(`ZenQuotes request failed (${response.status})`);
  }

  const data = (await response.json()) as ZenQuoteResponse[];
  return data
    .filter((item) => item.q && item.a)
    .map((item, index) => toQuote(item, index));
}

export async function fetchRandomQuote(): Promise<Quote> {
  await throttleRequest();

  const response = await fetch(buildUrl('random'));
  if (!response.ok) {
    throw new Error(`ZenQuotes request failed (${response.status})`);
  }

  const data = (await response.json()) as ZenQuoteResponse[];
  const first = data[0];
  if (!first?.q || !first?.a) {
    throw new Error('ZenQuotes returned an empty quote');
  }

  return toQuote(first, Date.now());
}
