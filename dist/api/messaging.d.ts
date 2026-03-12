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
import type { SendResult, BulkSendResult, ScheduledMessage, ReplyCallback, ReplyHandlerEntry, SendOptions, BulkSendOptions } from '../types/index.js';
export declare class MessagingAPI {
    private readonly ig;
    private readonly emitter;
    private readonly replyHandlers;
    private readonly trackSeen;
    constructor(ig: IgApiClient, emitter: IEmitter, replyHandlers: Map<string, ReplyHandlerEntry>, trackSeen: (id: string) => void);
    private parseResult;
    sendMessage(threadId: string, text: string, options?: SendOptions): Promise<SendResult>;
    sendMessageToUser(userId: string, text: string, options?: SendOptions): Promise<SendResult>;
    sendMessageBulk(targets: string[], text: string, options?: BulkSendOptions): Promise<BulkSendResult[]>;
    scheduleMessage(threadId: string, text: string, delayMs: number, options?: SendOptions): ScheduledMessage;
    sendMessageWithReply(threadId: string, text: string, onReply: ReplyCallback, options?: SendOptions): Promise<SendResult>;
    sendMessageToUserWithReply(userId: string, text: string, onReply: ReplyCallback, options?: SendOptions): Promise<SendResult>;
    registerReplyHandler(itemId: string, callback: ReplyCallback, timeoutMs?: number): void;
    clearReplyHandler(itemId: string): boolean;
    unsendMessage(threadId: string, itemId: string): Promise<void>;
    editMessage(threadId: string, itemId: string, newText: string): Promise<{
        success: true;
        item_id: string;
        new_text: string;
    }>;
    sendReaction(threadId: string, itemId: string, emoji: string): Promise<void>;
    removeReaction(threadId: string, itemId: string): Promise<void>;
    indicateTyping(threadId: string, isTyping?: boolean): Promise<void>;
}
export {};
//# sourceMappingURL=messaging.d.ts.map