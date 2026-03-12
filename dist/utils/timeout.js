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
export function withTimeout(promise, ms, label = 'operation') {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
            reject(new Error(`Timeout: ${label} exceeded ${ms}ms`));
        }, ms);
        promise.then((value) => { clearTimeout(timer); resolve(value); }, (err) => { clearTimeout(timer); reject(err); });
    });
}
//# sourceMappingURL=timeout.js.map