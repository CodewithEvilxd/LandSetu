export interface RetryOptions {
  maxRetries?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffFactor?: number;
  onRetry?: (attempt: number, error: Error, delayMs: number) => void;
}

export class StorageRetry {
  /**
   * Execute an async operation with exponential backoff
   */
  public static async executeWithRetry<T>(
    operation: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<T> {
    const maxRetries = options.maxRetries ?? 3;
    const initialDelayMs = options.initialDelayMs ?? 1000;
    const maxDelayMs = options.maxDelayMs ?? 10000;
    const factor = options.backoffFactor ?? 2;

    let attempt = 0;
    let currentDelay = initialDelayMs;

    while (true) {
      try {
        return await operation();
      } catch (err: any) {
        attempt++;
        if (attempt > maxRetries) {
          throw err;
        }

        const delay = Math.min(currentDelay, maxDelayMs);
        if (options.onRetry) {
          options.onRetry(attempt, err, delay);
        }

        await new Promise((resolve) => setTimeout(resolve, delay));
        currentDelay *= factor;
      }
    }
  }
}
