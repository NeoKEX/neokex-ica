/**
 * @module utils/format
 * Formatting and error-classification utilities.
 *
 * @author NeoKEX (https://github.com/NeoKEX)
 * @license MIT
 */
import type { ErrorKind } from '../types/index.js';
/**
 * Convert milliseconds to a human-readable uptime string.
 * e.g. `formatUptime(3665000)` → `"1h 1m 5s"`
 */
export declare function formatUptime(ms: number): string;
/**
 * Classify an error into one of four categories used for retry-backoff decisions.
 *
 * - `auth`      — session expired, login required, checkpoint
 * - `ratelimit` — HTTP 429, throttle, rate-limit
 * - `network`   — HTTP 5xx, ECONNREFUSED, timeout, ENOTFOUND
 * - `unknown`   — anything else
 */
export declare function classifyError(error: unknown): ErrorKind;
//# sourceMappingURL=format.d.ts.map