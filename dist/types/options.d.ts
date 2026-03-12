/**
 * @module types/options
 * Configuration and option type definitions.
 *
 * @author NeoKEX (https://github.com/NeoKEX)
 * @license MIT
 */
export interface PollingOptions {
    /** Starting poll interval in ms. Default: 5000 */
    interval?: number;
    /** Minimum poll interval (floor for adaptive scaling). Default: 3000 */
    minInterval?: number;
    /** Maximum poll interval (ceiling for adaptive scaling). Default: 30000 */
    maxInterval?: number;
    /** Number of consecutive errors before circuit breaker opens. Default: 5 */
    maxConsecutiveErrors?: number;
    /** Milliseconds the circuit breaker stays open before attempting recovery. Default: 60000 */
    circuitCooldown?: number;
}
export interface SendOptions {
    /** Reply to a specific message item ID. */
    replyToItemId?: string;
    /** Timeout (ms) for the onReply handler before it is auto-cleared. Default: 120000 */
    replyTimeout?: number;
}
export interface BulkSendOptions {
    /** Delay in ms between each send. Default: 1500 */
    delay?: number;
}
export interface EditProfileOptions {
    username?: string;
    name?: string;
    fullName?: string;
    biography?: string;
    bio?: string;
    email?: string;
    phone?: string;
    website?: string;
    externalUrl?: string;
    gender?: number;
}
export interface PollingStats {
    startedAt: number | null;
    totalPolls: number;
    totalErrors: number;
    consecutiveErrors: number;
    lastPollAt: number | null;
    lastErrorAt: number | null;
    lastErrorMsg: string | null;
    circuitOpen: boolean;
    circuitOpenedAt: number | null;
    currentInterval: number;
    uptime: number;
    uptimeFormatted: string;
    seenIdCount: number;
    replyHandlerCount: number;
    trackedThreads: number;
}
export interface BotStatus {
    isLoggedIn: boolean;
    userId: string | null;
    username: string | null;
    isPolling: boolean;
    pollingStats: PollingStats;
}
export interface ClientOptions {
    /** Set to false to suppress the startup banner. Default: true */
    showBanner?: boolean;
}
export type ErrorKind = 'auth' | 'ratelimit' | 'network' | 'unknown';
export interface RetryOptions {
    maxRetries?: number;
    label?: string;
    onRetry?: (info: {
        attempt: number;
        maxRetries: number;
        delay: number;
        error: Error;
        kind: ErrorKind;
        label: string;
    }) => void;
}
//# sourceMappingURL=options.d.ts.map