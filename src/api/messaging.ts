/**
 * @module api/messaging
 * Text messaging — send, schedule, reply, react, edit, unsend, mark seen.
 *
 * @author NeoKEX (https://github.com/NeoKEX)
 * @license MIT
 */

import type { IgApiClient } from 'instagram-private-api';
/** Minimal EventEmitter interface accepted by MessagingAPI. */
interface IEmitter {
  emit(event: string, ...args: unknown[]): boolean | void;
}
import logger               from '../logger.js';
import { withRetry }        from '../utils/retry.js';
import { sleep }            from '../utils/sleep.js';
import type {
  SendResult,
  BulkSendResult,
  ScheduledMessage,
  ReplyCallback,
  ReplyHandlerEntry,
  SendOptions,
  BulkSendOptions,
} from '../types/index.js';

export class MessagingAPI {
  constructor(
    private readonly ig:      IgApiClient,
    private readonly emitter: IEmitter,
    private readonly replyHandlers: Map<string, ReplyHandlerEntry>,
    private readonly trackSeen:     (id: string) => void,
  ) {}

  private parseResult(raw: Record<string, unknown>): SendResult {
    const payload = raw?.['payload'] as Record<string, unknown> | undefined;
    return {
      item_id:   (payload?.['item_id']   ?? raw['item_id']   ?? '') as string,
      thread_id: (payload?.['thread_id'] ?? raw['thread_id'] ?? '') as string,
      timestamp: (payload?.['timestamp'] ?? raw['timestamp'] ?? Date.now().toString()) as string,
      status: 'sent',
    };
  }

  // ─── Core send ─────────────────────────────────────────────────────────────

  async sendMessage(
    threadId: string,
    text: string,
    options: SendOptions = {},
  ): Promise<SendResult> {
    return withRetry(async () => {
      const thread = this.ig.entity.directThread(threadId);
      const raw    = options.replyToItemId
        ? await (thread as unknown as { broadcastText(t: string, o: { replyToMessageId: string }): Promise<unknown> })
            .broadcastText(text, { replyToMessageId: options.replyToItemId })
        : await (thread as unknown as { broadcastText(t: string): Promise<unknown> })
            .broadcastText(text);

      const result = this.parseResult(raw as Record<string, unknown>);
      result.text  = text;
      if (result.item_id) this.trackSeen(result.item_id);
      logger.info(`Message sent to thread ${threadId} (item: ${result.item_id})`);
      return result;
    }, {
      maxRetries: 3,
      label: 'sendMessage',
      onRetry: ({ attempt, delay }) =>
        logger.warn(`sendMessage retry ${attempt} in ${(delay / 1000).toFixed(1)}s`),
    });
  }

  async sendMessageToUser(
    userId: string,
    text: string,
    options: SendOptions = {},
  ): Promise<SendResult> {
    return withRetry(async () => {
      const raw = await (
        this.ig.entity.directThread([userId.toString()]) as unknown as {
          broadcastText(t: string): Promise<unknown>;
        }
      ).broadcastText(text);

      const result = this.parseResult(raw as Record<string, unknown>);
      result.text  = text;
      if (result.item_id) this.trackSeen(result.item_id);
      logger.info(`Message sent to user ${userId} (item: ${result.item_id})`);
      return result;
    }, {
      maxRetries: 3,
      label: 'sendMessageToUser',
      onRetry: ({ attempt, delay }) =>
        logger.warn(`sendMessageToUser retry ${attempt} in ${(delay / 1000).toFixed(1)}s`),
    });
  }

  // ─── Bulk & scheduled ──────────────────────────────────────────────────────

  async sendMessageBulk(
    targets: string[],
    text: string,
    options: BulkSendOptions = {},
  ): Promise<BulkSendResult[]> {
    const delay   = options.delay ?? 1500;
    const results: BulkSendResult[] = [];

    for (let i = 0; i < targets.length; i++) {
      const threadId = targets[i];
      try {
        const result = await this.sendMessage(threadId!, text);
        results.push({ threadId: threadId!, success: true, result });
      } catch (error) {
        results.push({ threadId: threadId!, success: false, error: (error as Error).message });
      }
      if (i < targets.length - 1 && delay > 0) await sleep(delay);
    }
    return results;
  }

  scheduleMessage(
    threadId: string,
    text: string,
    delayMs: number,
    options: SendOptions = {},
  ): ScheduledMessage {
    let timerId: ReturnType<typeof setTimeout>;

    const promise = new Promise<SendResult>((resolve, reject) => {
      timerId = setTimeout(async () => {
        try   { resolve(await this.sendMessage(threadId, text, options)); }
        catch (err) { reject(err as Error); }
      }, delayMs);
    }) as ScheduledMessage;

    promise.cancel = () => {
      clearTimeout(timerId);
      logger.debug(`Scheduled message to ${threadId} cancelled`);
    };

    return promise;
  }

  // ─── Reply handlers ────────────────────────────────────────────────────────

  async sendMessageWithReply(
    threadId: string,
    text: string,
    onReply: ReplyCallback,
    options: SendOptions = {},
  ): Promise<SendResult> {
    const result = await this.sendMessage(threadId, text, options);
    if (result.item_id) {
      this.registerReplyHandler(result.item_id, onReply, options.replyTimeout ?? 120_000);
    }
    return result;
  }

  async sendMessageToUserWithReply(
    userId: string,
    text: string,
    onReply: ReplyCallback,
    options: SendOptions = {},
  ): Promise<SendResult> {
    const result = await this.sendMessageToUser(userId, text, options);
    if (result.item_id) {
      this.registerReplyHandler(result.item_id, onReply, options.replyTimeout ?? 120_000);
    }
    return result;
  }

  registerReplyHandler(itemId: string, callback: ReplyCallback, timeoutMs = 120_000): void {
    const timerId = setTimeout(() => {
      this.replyHandlers.delete(itemId);
      logger.debug(`Reply handler for ${itemId} expired`);
    }, timeoutMs);

    this.replyHandlers.set(itemId, { callback, timerId, registeredAt: Date.now() });
    logger.debug(`Reply handler registered for ${itemId} (expires in ${timeoutMs / 1000}s)`);
  }

  clearReplyHandler(itemId: string): boolean {
    const entry = this.replyHandlers.get(itemId);
    if (!entry) return false;
    clearTimeout(entry.timerId);
    this.replyHandlers.delete(itemId);
    return true;
  }

  // ─── Message actions ───────────────────────────────────────────────────────

  async unsendMessage(threadId: string, itemId: string): Promise<void> {
    await (this.ig.entity.directThread(threadId) as unknown as { deleteItem(id: string): Promise<void> })
      .deleteItem(itemId);
    this.clearReplyHandler(itemId);
    logger.info(`Message ${itemId} unsent`);
  }

  async editMessage(threadId: string, itemId: string, newText: string): Promise<{ success: true; item_id: string; new_text: string }> {
    await (this.ig.entity.directThread(threadId) as unknown as { editMessage(id: string, t: string): Promise<void> })
      .editMessage(itemId, newText);
    logger.info(`Message ${itemId} edited`);
    return { success: true, item_id: itemId, new_text: newText };
  }

  async sendReaction(threadId: string, itemId: string, emoji: string): Promise<void> {
    await (this.ig.entity.directThread(threadId) as unknown as {
      broadcastReaction(o: { item_id: string; emoji_type: string; reaction: string }): Promise<void>;
    }).broadcastReaction({ item_id: itemId, emoji_type: 'emoji', reaction: emoji });
    logger.info(`Reaction "${emoji}" sent to message ${itemId}`);
  }

  async removeReaction(threadId: string, itemId: string): Promise<void> {
    await (this.ig.entity.directThread(threadId) as unknown as {
      deleteReaction(o: { item_id: string }): Promise<void>;
    }).deleteReaction({ item_id: itemId });
    logger.info(`Reaction removed from message ${itemId}`);
  }

  async indicateTyping(threadId: string, isTyping = true): Promise<void> {
    if (!isTyping) return;
    try {
      await (this.ig.entity.directThread(threadId) as unknown as {
        broadcastTypingIndicator(): Promise<void>;
      }).broadcastTypingIndicator();
    } catch { /* ignore */ }
  }
}
