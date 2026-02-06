/**
 * Options for polling operations.
 */
export interface PollingOptions {
  /** Maximum number of polling attempts (default: 24) */
  maxAttempts?: number;
  /** Interval between polls in milliseconds (default: 5000) */
  intervalMs?: number;
  /** Optional callback for each poll attempt */
  onAttempt?: (attempt: number) => void;
}

/**
 * Result of a polling operation.
 */
export type PollingResult<T> =
  | { success: true; data: T; attempts: number }
  | { success: false; error: string; attempts: number };

/**
 * Polls an async function until a condition is met or timeout.
 *
 * @param pollFn - Function to call on each poll
 * @param isDone - Predicate to check if polling should stop
 * @param options - Polling configuration
 * @returns The final result when isDone returns true
 * @throws Error if max attempts exceeded
 *
 * @example
 * const result = await pollWithTimeout(
 *   () => checkJobStatus(jobId),
 *   (status) => status.state === 'completed',
 *   { maxAttempts: 30, intervalMs: 2000 }
 * );
 */
export async function pollWithTimeout<T>(
  pollFn: () => Promise<T>,
  isDone: (result: T) => boolean,
  options: PollingOptions = {}
): Promise<T> {
  const { maxAttempts = 24, intervalMs = 5000, onAttempt } = options;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    onAttempt?.(attempt);

    const result = await pollFn();
    if (isDone(result)) {
      return result;
    }

    if (attempt < maxAttempts) {
      await delay(intervalMs);
    }
  }

  throw new Error(`Polling timeout: exceeded ${maxAttempts} attempts`);
}

/**
 * Safe version of pollWithTimeout that returns a result object instead of throwing.
 */
export async function pollWithTimeoutSafe<T>(
  pollFn: () => Promise<T>,
  isDone: (result: T) => boolean,
  options: PollingOptions = {}
): Promise<PollingResult<T>> {
  const { maxAttempts = 24, intervalMs = 5000, onAttempt } = options;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    onAttempt?.(attempt);

    try {
      const result = await pollFn();
      if (isDone(result)) {
        return { success: true, data: result, attempts: attempt };
      }
    } catch (error) {
      // Continue polling on error, let it eventually timeout
      console.warn(`Poll attempt ${attempt} failed:`, error);
    }

    if (attempt < maxAttempts) {
      await delay(intervalMs);
    }
  }

  return {
    success: false,
    error: `Polling timeout: exceeded ${maxAttempts} attempts`,
    attempts: maxAttempts,
  };
}

/**
 * Simple delay utility.
 */
export const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));
