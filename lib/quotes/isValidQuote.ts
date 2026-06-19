import type { Quote } from '@/lib/quotes/types';

export function isValidQuote(quote: Quote | null | undefined): quote is Quote {
  return Boolean(quote?.id && quote.text?.trim() && quote.author?.trim());
}
