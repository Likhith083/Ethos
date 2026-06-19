/** Spring used for quote swipe release and bottom sheet motion. */
export const springConfig = {
  quoteSwipe: {
    damping: 22,
    stiffness: 220,
    mass: 0.9,
  },
  sheet: {
    open: { duration: 280 as const },
    close: { duration: 220 as const },
  },
} as const;
