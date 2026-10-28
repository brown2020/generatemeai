export interface RateWindow {
  windowStart: number;
  count: number;
}

export interface RateDecision {
  allowed: boolean;
  next: RateWindow;
  retryAfterMs: number;
}

/**
 * Fixed-window counter. The window is stored with the decision so a denied
 * call still keeps the caller at the cap until the window expires.
 */
export function consumeRate(
  state: RateWindow | null,
  now: number,
  limit: number,
  windowMs: number
): RateDecision {
  if (!state || now - state.windowStart >= windowMs) {
    return {
      allowed: true,
      next: { windowStart: now, count: 1 },
      retryAfterMs: 0,
    };
  }

  if (state.count >= limit) {
    return {
      allowed: false,
      next: state,
      retryAfterMs: Math.max(0, windowMs - (now - state.windowStart)),
    };
  }

  return {
    allowed: true,
    next: { windowStart: state.windowStart, count: state.count + 1 },
    retryAfterMs: 0,
  };
}
