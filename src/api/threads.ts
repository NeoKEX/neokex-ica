/**
 * @module api/threads
 * Thread and inbox management — get, create, approve, mute, archive, delete.
 *
 * @author NeoKEX (https://github.com/NeoKEX)
 * @license MIT
 */

import type { IgApiClient } from 'instagram-private-api';
import logger  from '../logger.js';
import { sleep } from '../utils/sleep.js';
import { withTimeout } from '../utils/timeout.js';
import type {
  InboxResult,
  FullInboxResult,
  PendingInboxResult,
  Thread,
  ThreadResult,
  RawMessageItem,
} from '../types/index.js';

const POLL_TIMEOUT = 20_000;

export class ThreadsAPI {
  constructor(
    private readonly ig:     IgApiClient,
    private readonly userId: () => string | null,
  ) {}

  // ─── Inbox ─────────────────────────────────────────────────────────────────

  async getInbox(): Promise<InboxResult> {
    try {
      const feed    = this.ig.feed.directInbox();
      const threads = await withTimeout(feed.items(), POLL_TIMEOUT, 'getInbox') as unknown as Thread[];
      return {
        threads,
        has_older:              !!(feed as unknown as { moreAvailable: boolean }).moreAvailable,
        cursor:                 (feed as unknown as { cursor: string | null }).cursor ?? null,
        unseen_count: threads.filter((t) => {
          const last = t.items?.[0] ?? t.last_permanent_item;
          return last?.user_id && String(last.user_id) !== this.userId();
        }).length,
        pending_requests_total: 0,
      };
    } catch (error) {
      logger.error('Failed to get inbox:', (error as Error).message);
      return { threads: [], has_older: false, cursor: null, unseen_count: 0, pending_requests_total: 0 };
    }
  }

  async getFullInbox(maxPages = 5): Promise<FullInboxResult> {
    const feed   = this.ig.feed.directInbox();
    const all: Thread[] = [];
    let page = 0;
    do {
      const batch = await feed.items() as unknown as Thread[];
      all.push(...batch);
      page++;
      if ((feed as unknown as { isMoreAvailable(): boolean }).isMoreAvailable() && page < maxPages)
        await sleep(600);
    } while ((feed as unknown as { isMoreAvailable(): boolean }).isMoreAvailable() && page < maxPages);
    return { threads: all, total: all.length };
  }

  async getUnreadThreads(): Promise<Thread[]> {
    const inbox = await this.getInbox();
    return inbox.threads.filter((t) => {
      const last = t.items?.[0] ?? t.last_permanent_item;
      return last?.user_id && String(last.user_id) !== this.userId();
    });
  }

  async getPendingInbox(): Promise<PendingInboxResult> {
    try {
      const feed    = this.ig.feed.directPending();
      const threads = await feed.items() as unknown as Thread[];
      return { threads, has_older: !!(feed as unknown as { moreAvailable: boolean }).moreAvailable };
    } catch (error) {
      logger.error('Failed to get pending inbox:', (error as Error).message);
      throw new Error(`Failed to get pending inbox: ${(error as Error).message}`);
    }
  }

  // ─── Single thread ─────────────────────────────────────────────────────────

  async getThread(threadId: string, cursor?: string): Promise<ThreadResult> {
    try {
      const feed  = this.ig.feed.directThread({ thread_id: threadId, oldest_cursor: cursor ?? '' });
      const items = await feed.items() as unknown as RawMessageItem[];
      return {
        thread_id: threadId,
        items,
        has_older: (feed as unknown as { isMoreAvailable(): boolean }).isMoreAvailable(),
        cursor:    (feed as unknown as { cursor: string | null }).cursor ?? null,
        users:     [],
      };
    } catch (error) {
      logger.error('Failed to get thread:', (error as Error).message);
      throw new Error(`Failed to get thread: ${(error as Error).message}`);
    }
  }

  async getThreadMessages(threadId: string, limit = 20): Promise<RawMessageItem[]> {
    const feed  = this.ig.feed.directThread({ thread_id: threadId, oldest_cursor: '' });
    const items = await feed.items() as unknown as RawMessageItem[];
    return items.slice(0, limit);
  }

  async getThreadParticipants(threadId: string): Promise<unknown[]> {
    const inbox  = await this.getInbox();
    const thread = inbox.threads.find((t) => t.thread_id === threadId);
    if (thread) return thread.users ?? [];
    throw new Error('Thread not found in inbox');
  }

  async getThreadIdByUsername(username: string): Promise<string | null> {
    const uid    = await this.ig.user.getIdByUsername(username);
    const inbox  = await this.getInbox();
    const thread = inbox.threads.find((t) =>
      t.users?.some((u) => String(u.pk) === String(uid)),
    );
    if (thread) return thread.thread_id;
    const newThread = await this.ig.entity.directThread([uid.toString()]);
    return (newThread as unknown as { threadId: string }).threadId ?? null;
  }

  async searchMessages(threadId: string, query: string): Promise<RawMessageItem[]> {
    const thread = await this.getThread(threadId);
    const q      = query.toLowerCase();
    return thread.items.filter((i) => (i['text'] as string | undefined)?.toLowerCase().includes(q));
  }

  async getRecentMessages(limit = 20): Promise<RawMessageItem[]> {
    const inbox    = await this.getInbox();
    const messages: RawMessageItem[] = [];
    for (const thread of inbox.threads.slice(0, 5)) {
      if (thread.items) messages.push(...thread.items.slice(0, Math.ceil(limit / 5)));
    }
    return messages.slice(0, limit);
  }

  // ─── Thread creation ───────────────────────────────────────────────────────

  async createThread(userIds: string[]): Promise<unknown> {
    const ids    = userIds.map(String);
    const thread = await this.ig.direct.createGroupThread(ids, '');
    logger.info(`Thread created with users: ${ids.join(', ')}`);
    return thread;
  }

  // ─── Thread actions ────────────────────────────────────────────────────────

  async markAsSeen(threadId: string, itemId: string): Promise<void> {
    try {
      await (this.ig.entity.directThread(threadId) as unknown as {
        markItemSeen(id: string): Promise<void>;
      }).markItemSeen(itemId);
      logger.info(`Marked message ${itemId} as seen`);
    } catch (error) {
      logger.error('Failed to mark as seen:', (error as Error).message);
      throw new Error(`Failed to mark as seen: ${(error as Error).message}`);
    }
  }

  async markAllThreadsSeen(): Promise<{ marked: number }> {
    const inbox = await this.getInbox();
    let marked  = 0;
    for (const thread of inbox.threads) {
      const last = thread.items?.[0];
      if (last?.item_id) {
        try {
          await this.markAsSeen(thread.thread_id, last.item_id);
          marked++;
          await sleep(300);
        } catch { /* ignore */ }
      }
    }
    logger.info(`Marked ${marked} threads as seen`);
    return { marked };
  }

  async approveThread(threadId: string): Promise<void> {
    await (this.ig.entity.directThread(threadId) as unknown as { approve(): Promise<void> }).approve();
    logger.info(`Thread ${threadId} approved`);
  }

  async declineThread(threadId: string): Promise<void> {
    await (this.ig.entity.directThread(threadId) as unknown as { decline(): Promise<void> }).decline();
    logger.info(`Thread ${threadId} declined`);
  }

  async muteThread(threadId: string): Promise<void> {
    await (this.ig.entity.directThread(threadId) as unknown as { mute(): Promise<void> }).mute();
    logger.info(`Thread ${threadId} muted`);
  }

  async unmuteThread(threadId: string): Promise<void> {
    await (this.ig.entity.directThread(threadId) as unknown as { unmute(): Promise<void> }).unmute();
    logger.info(`Thread ${threadId} unmuted`);
  }

  async deleteThread(threadId: string): Promise<void> {
    await (this.ig.entity.directThread(threadId) as unknown as { hide(): Promise<void> }).hide();
    logger.info(`Thread ${threadId} deleted`);
  }

  async archiveThread(threadId: string): Promise<void> {
    await (this.ig.entity.directThread(threadId) as unknown as { hide(): Promise<void> }).hide();
    logger.info(`Thread ${threadId} archived`);
  }

  async unarchiveThread(threadId: string): Promise<void> {
    await (this.ig.entity.directThread(threadId) as unknown as { unhide(): Promise<void> }).unhide();
    logger.info(`Thread ${threadId} unarchived`);
  }

  async leaveThread(threadId: string): Promise<void> {
    await (this.ig.entity.directThread(threadId) as unknown as { leave(): Promise<void> }).leave();
    logger.info(`Left thread ${threadId}`);
  }

  async addUsersToThread(threadId: string, userIds: string[]): Promise<void> {
    const ids = userIds.map(String);
    await (this.ig.entity.directThread(threadId) as unknown as {
      addUser(ids: string[]): Promise<void>;
    }).addUser(ids);
    logger.info(`Added ${ids.length} user(s) to thread ${threadId}`);
  }

  async removeUserFromThread(threadId: string, userId: string): Promise<void> {
    await (this.ig.entity.directThread(threadId) as unknown as {
      removeUser(id: string): Promise<void>;
    }).removeUser(userId.toString());
    logger.info(`User ${userId} removed from thread ${threadId}`);
  }

  async updateThreadTitle(threadId: string, title: string): Promise<void> {
    await (this.ig.entity.directThread(threadId) as unknown as {
      updateTitle(t: string): Promise<void>;
    }).updateTitle(title);
    logger.info(`Thread title updated: "${title}"`);
  }
}
