/**
 * @module types/message
 * Message and send operation type definitions.
 *
 * @author NeoKEX (https://github.com/NeoKEX)
 * @license MIT
 */

export interface SendResult {
  item_id: string;
  thread_id: string;
  timestamp: string;
  text?: string;
  status: 'sent' | 'failed';
}

export interface MessageEvent {
  thread_id: string;
  item_id: string;
  user_id: string | number;
  text: string;
  timestamp: string;
  is_from_me: boolean;
  thread_title: string | null;
  thread_users: unknown[];
  /** Raw item from instagram-private-api */
  message: RawMessageItem;
  /** Present if this message was a reply to another */
  messageReply?: MessageReply;
}

export interface MessageReply {
  item_id: string;
  text: string;
  user_id: string | number;
  timestamp: string;
}

export interface RawMessageItem {
  item_id?: string;
  user_id?: string | number;
  text?: string;
  timestamp?: string;
  item_type?: string;
  media?: unknown;
  replied_to_message?: RawMessageItem;
  [key: string]: unknown;
}

export interface BulkSendResult {
  threadId: string;
  success: boolean;
  result?: SendResult;
  error?: string;
}

export interface ScheduledMessage extends Promise<SendResult> {
  /** Cancel the scheduled message before it fires. */
  cancel: () => void;
}

export interface ReplyHandlerEntry {
  callback: ReplyCallback;
  timerId: ReturnType<typeof setTimeout>;
  registeredAt: number;
}

export type ReplyCallback = (event: MessageEvent) => void | Promise<void>;

export interface MediaInfo {
  item_id: string;
  item_type: string | undefined;
  media: {
    id?: string;
    media_type?: number;
    images?: Array<{ url: string; width: number; height: number }>;
    videos?: Array<{ url: string; width: number; height: number; type: number }>;
    carousel?: Array<{
      id: string;
      images?: unknown[];
      videos?: unknown[];
    }>;
  } | null;
}

export interface DownloadedMedia {
  path: string;
  size: number;
  type: string;
  url: string;
}
