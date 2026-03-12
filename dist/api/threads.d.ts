/**
 * @module api/threads
 * Thread and inbox management — get, create, approve, mute, archive, delete.
 *
 * @author NeoKEX (https://github.com/NeoKEX)
 * @license MIT
 */
import type { IgApiClient } from 'instagram-private-api';
import type { InboxResult, FullInboxResult, PendingInboxResult, Thread, ThreadResult, RawMessageItem } from '../types/index.js';
export declare class ThreadsAPI {
    private readonly ig;
    private readonly userId;
    constructor(ig: IgApiClient, userId: () => string | null);
    getInbox(): Promise<InboxResult>;
    getFullInbox(maxPages?: number): Promise<FullInboxResult>;
    getUnreadThreads(): Promise<Thread[]>;
    getPendingInbox(): Promise<PendingInboxResult>;
    getThread(threadId: string, cursor?: string): Promise<ThreadResult>;
    getThreadMessages(threadId: string, limit?: number): Promise<RawMessageItem[]>;
    getThreadParticipants(threadId: string): Promise<unknown[]>;
    getThreadIdByUsername(username: string): Promise<string | null>;
    searchMessages(threadId: string, query: string): Promise<RawMessageItem[]>;
    getRecentMessages(limit?: number): Promise<RawMessageItem[]>;
    createThread(userIds: string[]): Promise<unknown>;
    markAsSeen(threadId: string, itemId: string): Promise<void>;
    markAllThreadsSeen(): Promise<{
        marked: number;
    }>;
    approveThread(threadId: string): Promise<void>;
    declineThread(threadId: string): Promise<void>;
    muteThread(threadId: string): Promise<void>;
    unmuteThread(threadId: string): Promise<void>;
    deleteThread(threadId: string): Promise<void>;
    archiveThread(threadId: string): Promise<void>;
    unarchiveThread(threadId: string): Promise<void>;
    leaveThread(threadId: string): Promise<void>;
    addUsersToThread(threadId: string, userIds: string[]): Promise<void>;
    removeUserFromThread(threadId: string, userId: string): Promise<void>;
    updateThreadTitle(threadId: string, title: string): Promise<void>;
}
//# sourceMappingURL=threads.d.ts.map