/**
 * @module utils/retry
 * Exponential-backoff retry with per-error-kind delays.
 *
 * @author NeoKEX (https://github.com/NeoKEX)
 * @license MIT
 */
import type { RetryOptions } from '../types/index.js';
/**
 * Calculate a jitter-augmented exponential-backoff delay.
 *
 * @param attempt - Current attempt number (1-based).
 * @param base    - Base delay in ms. Default: 2000
 * @param max     - Maximum delay cap in ms. Default: 60000
 */
export declare function exponentialBackoff(attempt: number, base?: number, max?: number): number;
/**
 * Execute `fn` with automatic retries and exponential backoff.
 *
 * - Auth errors are re-thrown immediately without retrying.
 * - Rate-limit errors use a longer base delay (10s–120s).
 * - Network / unknown errors use a shorter base delay (2s–30s).
 *
 * @param fn      - Async function to execute.
 * @param options - Retry configuration.
 */
export declare function withRetry<T>(fn: () => Promise<T>, options?: RetryOptions): Promise<T>;
//# sourceMappingURL=retry.d.ts.map