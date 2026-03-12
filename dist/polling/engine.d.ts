/**
 * @module polling/engine
 * Adaptive polling loop with circuit breaker, LRU seen-ID cache, and graceful shutdown.
 *
 * Architecture:
 *   - Adaptive interval: scales down on activity, up when quiet.
 *   - Circuit breaker: opens after N consecutive errors, auto-recovers after cooldown.
 *   - Per-cycle timeout: hung HTTP calls never stall the loop.
 *   - LRU eviction: seenMessageIds capped at 5,000 entries.
 *   - Reply-handler sweep: periodic cleanup prevents leaks.
 *   - SIGTERM / SIGINT: graceful shutdown with event emission.
 *
 * @author NeoKEX (https://github.com/NeoKEX)
 * @license MIT
 */
import type { IgApiClient } from 'instagram-private-api';
/** Minimal client interface accepted by PollingEngine. */
interface IClient {
    userId: string | null;
    emit(event: string, ...args: unknown[]): boolean | void;
}
import type { PollingOptions, PollingStats, ReplyHandlerEntry } from '../types/index.js';
export declare class PollingEngine {
    private readonly ig;
    private readonly client;
    isPolling: boolean;
    private isSeeded;
    private shutdownBound;
    private seenMessageIds;
    private seenIdTimestamps;
    private threadLastItemMap;
    readonly replyHandlers: Map<string, ReplyHandlerEntry>;
    private stats;
    constructor(ig: IgApiClient, client: IClient);
    trackSeen(itemId: string): void;
    private evictOldSeenIds;
    sweepExpiredReplyHandlers(maxAge?: number): void;
    getPollingStats(): PollingStats;
    private registerShutdownHandlers;
    private seedSeenIds;
    private pollCycle;
    startPolling(options?: PollingOptions | number): Promise<void>;
    stopPolling(): void;
    restartPolling(options?: PollingOptions | number): Promise<void>;
}
export {};
//# sourceMappingURL=engine.d.ts.map