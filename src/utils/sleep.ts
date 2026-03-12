/**
 * @module utils/sleep
 * Promise-based delay utility.
 *
 * @author NeoKEX (https://github.com/NeoKEX)
 * @license MIT
 */

/**
 * Pause execution for the given number of milliseconds.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
