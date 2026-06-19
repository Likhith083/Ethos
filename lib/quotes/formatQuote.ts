import type { Quote } from '@/lib/quotes/types';

/** Plain-text representation for clipboard copy. */
export function formatQuotePlainText(quote: Quote): string {
  return `"${quote.text}"\n— ${quote.author}`;
}
