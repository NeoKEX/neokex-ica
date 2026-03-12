/**
 * @module utils/timeout
 * Hard-deadline wrapper for any promise.
 *
 * @author NeoKEX (https://github.com/NeoKEX)
 * @license MIT
 */
/**
 * Race a promise against a deadline.
 * Rejects with a descriptive error if `ms` elapses before `promise` settles.
 *
 * @param promise - The operation to time-limit.
 * @param ms      - Timeout in milliseconds.
 * @param label   - Human-readable label used in the rejection message.
 */
export declare function withTimeout<T>(promise: Promise<T>, ms: number, label?: string): Promise<T>;
//# sourceMappingURL=timeout.d.ts.map