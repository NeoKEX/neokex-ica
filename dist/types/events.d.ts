/**
 * @module types/events
 * Event payload type definitions for all emitted events.
 *
 * @author NeoKEX (https://github.com/NeoKEX)
 * @license MIT
 */
import type { MessageEvent } from './message.js';
import type { Thread } from './thread.js';
import type { PollingStats } from './options.js';
export interface EventMap {
    /** Emitted when a new message arrives in any thread. */
    message: [event: MessageEvent];
    /** Emitted when there are new pending DM requests. */
    pending_request: [event: {
        count: number;
        threads: Thread[];
    }];
    /** Emitted on any polling or send error. */
    error: [error: Error];
    /** Emitted on a successful login. */
    login: [event: {
        userId: string;
        username: string;
    }];
    /** Emitted when Instagram rate-limits a request. */
    ratelimit: [event: {
        retryAfter?: number;
    }];
    /** Emitted when a typing indicator is received. */
    typing: [event: {
        thread_id: string;
        user_id: string;
    }];
    /** Emitted when polling starts. */
    'polling:start': [event: {
        interval: number;
    }];
    /** Emitted when polling stops. */
    'polling:stop': [stats: PollingStats];
    /** Emitted when an auth failure is detected during polling. */
    'session:expired': [event: {
        error: Error;
    }];
    /** Emitted when the circuit breaker opens. */
    'circuit:open': [event: {
        consecutiveErrors: number;
        cooldown: number;
    }];
    /** Emitted when the circuit breaker recovers. */
    'circuit:closed': [];
    /** Emitted when cookies are loaded from file. */
    'cookies:loaded': [event: {
        cookieFile: string;
    }];
    /** Emitted when cookies are saved to file. */
    'cookies:saved': [event: {
        cookieFile: string;
    }];
    /** Emitted when the process receives SIGTERM or SIGINT. */
    shutdown: [event: {
        signal: string;
    }];
}
//# sourceMappingURL=events.d.ts.map