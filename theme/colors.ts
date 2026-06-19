/** App chrome and quote surface color tokens. */
export const colors = {
  environment: '#0F1115',
  foreground: '#F5F5F7',
  muted: '#8E8E93',
  overlay: 'rgba(0, 0, 0, 0.5)',
  sheet: '#FFFFFF',
  sheetDark: '#1C1C1E',
  border: 'rgba(0, 0, 0, 0.08)',
  borderDark: 'rgba(255, 255, 255, 0.12)',
  primary: '#1A1A1A',
  primaryText: '#FFFFFF',
} as const;

export type QuoteSurfaceColors = {
  environment: string;
  quoteText: string;
  authorText: string;
  cardBackground?: string;
};
