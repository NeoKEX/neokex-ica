/**
 * @module types/thread
 * Thread and inbox type definitions.
 *
 * @author NeoKEX (https://github.com/NeoKEX)
 * @license MIT
 */
import type { RawMessageItem } from './message.js';
export interface ThreadUser {
    pk: number | string;
    username: string;
    full_name?: string;
    profile_pic_url?: string;
    is_private?: boolean;
    [key: string]: unknown;
}
export interface Thread {
    thread_id: string;
    thread_title?: string;
    users?: ThreadUser[];
    items?: RawMessageItem[];
    last_permanent_item?: RawMessageItem;
    has_older?: boolean;
    cursor?: string | null;
    [key: string]: unknown;
}
export interface InboxResult {
    threads: Thread[];
    has_older: boolean;
    cursor: string | null;
    unseen_count: number;
    pending_requests_total: number;
}
export interface FullInboxResult {
    threads: Thread[];
    total: number;
}
export interface PendingInboxResult {
    threads: Thread[];
    has_older: boolean;
}
export interface ThreadResult {
    thread_id: string;
    items: RawMessageItem[];
    has_older: boolean;
    cursor: string | null;
    users: ThreadUser[];
}
//# sourceMappingURL=thread.d.ts.map