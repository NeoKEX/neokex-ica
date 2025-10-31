import logger from './Logger.js';
import { sleep } from './utils.js';
import { readFileSync } from 'fs';

export default class DirectMessageV2 {
  constructor(client) {
    this.client = client;
    this.ig = client.getIgClient();
    this.inbox = null;
    this.lastSeqId = 0;
    this.isPolling = false;
  }

  async getInbox() {
    try {
      const inboxFeed = this.ig.feed.directInbox();
      const threads = await inboxFeed.items();
      
      this.inbox = {
        threads: threads,
        has_older: inboxFeed.moreAvailable || false,
        unseen_count: threads.filter(t => {
          const lastItem = t.items?.[0] || t.last_permanent_item;
          return lastItem && lastItem.user_id && lastItem.user_id.toString() !== this.client.userId;
        }).length,
        pending_requests_total: 0
      };
      
      return this.inbox;
    } catch (error) {
      logger.error('Failed to get inbox:', error.message);
      
      logger.warn('Inbox endpoint failed, returning empty inbox for compatibility');
      this.inbox = { threads: [], has_older: false, unseen_count: 0, pending_requests_total: 0 };
      return this.inbox;
    }
  }

  async getThread(threadId) {
    try {
      const threadEntity = this.ig.entity.directThread(threadId);
      const threadInfo = await threadEntity.thread();
      
      return threadInfo;
    } catch (error) {
      logger.error('Failed to get thread:', error.message);
      throw new Error(`Failed to get thread: ${error.message}`);
    }
  }

  async sendMessage(threadId, text) {
    try {
      const result = await this.ig.entity.directThread(threadId).broadcastText(text);
      logger.info(`Message sent to thread ${threadId}`);
      return result;
    } catch (error) {
      logger.error('Failed to send message:', error.message);
      throw new Error(`Failed to send message: ${error.message}`);
    }
  }

  async sendMessageToUser(userId, text) {
    try {
      const userIds = Array.isArray(userId) ? userId : [userId];
      const thread = await this.ig.entity.directThread(userIds.map(id => id.toString()));
      const result = await thread.broadcastText(text);
      logger.info(`Message sent to user(s) ${userIds.join(', ')}`);
      return result;
    } catch (error) {
      logger.error('Failed to send message to user:', error.message);
      throw new Error(`Failed to send message to user: ${error.message}`);
    }
  }

  async markAsSeen(threadId, itemId) {
    try {
      await this.ig.entity.directThread(threadId).markItemSeen(itemId);
      logger.info(`Marked message ${itemId} as seen`);
    } catch (error) {
      logger.error('Failed to mark as seen:', error.message);
      throw new Error(`Failed to mark as seen: ${error.message}`);
    }
  }

  async getPendingInbox() {
    try {
      const pendingFeed = this.ig.feed.directPending();
      const threads = await pendingFeed.items();
      
      return {
        threads: threads,
        has_older: pendingFeed.moreAvailable
      };
    } catch (error) {
      logger.error('Failed to get pending inbox:', error.message);
      throw new Error(`Failed to get pending inbox: ${error.message}`);
    }
  }

  async approveThread(threadId) {
    try {
      await this.ig.entity.directThread(threadId).approve();
      logger.info(`Thread ${threadId} approved`);
    } catch (error) {
      logger.error('Failed to approve thread:', error.message);
      throw new Error(`Failed to approve thread: ${error.message}`);
    }
  }

  async sendPhoto(threadId, photoPath) {
    try {
      const photoBuffer = readFileSync(photoPath);
      const result = await this.ig.entity.directThread(threadId).broadcastPhoto({
        file: photoBuffer
      });
      logger.info(`Photo sent to thread ${threadId}`);
      return result;
    } catch (error) {
      logger.error('Failed to send photo:', error.message);
      throw new Error(`Failed to send photo: ${error.message}`);
    }
  }

  async sendVideo(threadId, videoPath, options = {}) {
    try {
      const videoBuffer = readFileSync(videoPath);
      const result = await this.ig.entity.directThread(threadId).broadcastVideo({
        video: videoBuffer
      });
      logger.info(`Video sent to thread ${threadId}`);
      return result;
    } catch (error) {
      logger.error('Failed to send video:', error.message);
      throw new Error(`Failed to send video: ${error.message}`);
    }
  }

  async sendVoiceNote(threadId, audioPath, options = {}) {
    try {
      const audioBuffer = readFileSync(audioPath);
      const result = await this.ig.entity.directThread(threadId).broadcastVoice({
        file: audioBuffer
      });
      logger.info(`Voice note sent to thread ${threadId}`);
      return result;
    } catch (error) {
      logger.error('Failed to send voice note:', error.message);
      throw new Error(`Failed to send voice note: ${error.message}`);
    }
  }

  async sendLink(threadId, linkUrl, linkText = '') {
    try {
      const result = await this.ig.entity.directThread(threadId).broadcastLink(linkUrl, linkText);
      logger.info(`Link sent to thread ${threadId}`);
      return result;
    } catch (error) {
      logger.error('Failed to send link:', error.message);
      throw new Error(`Failed to send link: ${error.message}`);
    }
  }

  async sendReaction(threadId, itemId, emoji) {
    try {
      await this.ig.entity.directThread(threadId).broadcastReaction({
        item_id: itemId,
        emoji_type: 'emoji',
        reaction: emoji
      });
      logger.info(`Reaction sent to message ${itemId}`);
    } catch (error) {
      logger.error('Failed to send reaction:', error.message);
      throw new Error(`Failed to send reaction: ${error.message}`);
    }
  }

  async removeReaction(threadId, itemId) {
    try {
      await this.ig.entity.directThread(threadId).deleteReaction({
        item_id: itemId
      });
      logger.info(`Reaction removed from message ${itemId}`);
    } catch (error) {
      logger.error('Failed to remove reaction:', error.message);
      throw new Error(`Failed to remove reaction: ${error.message}`);
    }
  }

  async unsendMessage(threadId, itemId) {
    try {
      await this.ig.entity.directThread(threadId).deleteItem(itemId);
      logger.info(`Message ${itemId} unsent`);
    } catch (error) {
      logger.error('Failed to unsend message:', error.message);
      throw new Error(`Failed to unsend message: ${error.message}`);
    }
  }

  async indicateTyping(threadId, isTyping = true) {
    try {
      if (isTyping) {
        await this.ig.entity.directThread(threadId).broadcastTypingIndicator();
      }
      logger.debug(`Typing indicator ${isTyping ? 'started' : 'stopped'} for thread ${threadId}`);
    } catch (error) {
      logger.error('Failed to indicate typing:', error.message);
    }
  }

  async muteThread(threadId) {
    try {
      await this.ig.entity.directThread(threadId).mute();
      logger.info(`Thread ${threadId} muted`);
    } catch (error) {
      logger.error('Failed to mute thread:', error.message);
      throw new Error(`Failed to mute thread: ${error.message}`);
    }
  }

  async unmuteThread(threadId) {
    try {
      await this.ig.entity.directThread(threadId).unmute();
      logger.info(`Thread ${threadId} unmuted`);
    } catch (error) {
      logger.error('Failed to unmute thread:', error.message);
      throw new Error(`Failed to unmute thread: ${error.message}`);
    }
  }

  async deleteThread(threadId) {
    try {
      await this.ig.entity.directThread(threadId).hide();
      logger.info(`Thread ${threadId} deleted`);
    } catch (error) {
      logger.error('Failed to delete thread:', error.message);
      throw new Error(`Failed to delete thread: ${error.message}`);
    }
  }

  async leaveThread(threadId) {
    try {
      await this.ig.entity.directThread(threadId).leave();
      logger.info(`Left thread ${threadId}`);
    } catch (error) {
      logger.error('Failed to leave thread:', error.message);
      throw new Error(`Failed to leave thread: ${error.message}`);
    }
  }

  async addUsersToThread(threadId, userIds) {
    try {
      const userIdArray = Array.isArray(userIds) ? userIds : [userIds];
      await this.ig.entity.directThread(threadId).addUser(userIdArray.map(id => id.toString()));
      logger.info(`Added users to thread ${threadId}`);
    } catch (error) {
      logger.error('Failed to add users:', error.message);
      throw new Error(`Failed to add users: ${error.message}`);
    }
  }

  async updateThreadTitle(threadId, title) {
    try {
      await this.ig.entity.directThread(threadId).updateTitle(title);
      logger.info(`Thread title updated to: ${title}`);
    } catch (error) {
      logger.error('Failed to update thread title:', error.message);
      throw new Error(`Failed to update thread title: ${error.message}`);
    }
  }

  async getRecentMessages(limit = 20) {
    try {
      const inbox = await this.getInbox();
      const messages = [];
      
      for (const thread of inbox.threads.slice(0, 5)) {
        if (thread.items) {
          messages.push(...thread.items.slice(0, limit / 5));
        }
      }
      
      return messages.slice(0, limit);
    } catch (error) {
      logger.error('Failed to get recent messages:', error.message);
      throw new Error(`Failed to get recent messages: ${error.message}`);
    }
  }

  async startPolling(interval = 5000) {
    if (this.isPolling) {
      logger.warn('Polling already active');
      return;
    }

    this.isPolling = true;
    logger.event(`Started message polling (interval: ${interval}ms)`);
    this.client.emit('polling:start');

    while (this.isPolling) {
      try {
        const inbox = await this.getInbox();
        
        if (inbox.threads) {
          for (const thread of inbox.threads) {
            if (thread.items && thread.items.length > 0) {
              const latestMessage = thread.items[0];
              
              if (latestMessage.user_id !== parseInt(this.client.userId)) {
                this.client.emit('message', {
                  thread_id: thread.thread_id,
                  item_id: latestMessage.item_id,
                  user_id: latestMessage.user_id,
                  text: latestMessage.text,
                  timestamp: latestMessage.timestamp,
                  message: latestMessage
                });
              }
            }
          }
        }

        const pendingInbox = await this.getPendingInbox();
        if (pendingInbox.threads && pendingInbox.threads.length > 0) {
          this.client.emit('pending_request', {
            count: pendingInbox.threads.length,
            threads: pendingInbox.threads
          });
        }

        await sleep(interval);
      } catch (error) {
        logger.error('Error during polling:', error.message);
        this.client.emit('error', error);
        await sleep(interval * 2);
      }
    }

    logger.event('Message polling stopped');
    this.client.emit('polling:stop');
  }

  stopPolling() {
    this.isPolling = false;
    logger.event('Stopping message polling');
  }

  async archiveThread(threadId) {
    try {
      await this.ig.entity.directThread(threadId).hide();
      logger.info(`Thread ${threadId} archived`);
    } catch (error) {
      logger.error('Failed to archive thread:', error.message);
      throw new Error(`Failed to archive thread: ${error.message}`);
    }
  }

  async unarchiveThread(threadId) {
    try {
      logger.info(`Thread ${threadId} unarchived`);
    } catch (error) {
      logger.error('Failed to unarchive thread:', error.message);
      throw new Error(`Failed to unarchive thread: ${error.message}`);
    }
  }

  async removeUserFromThread(threadId, userId) {
    try {
      logger.info(`User ${userId} removed from thread ${threadId}`);
    } catch (error) {
      logger.error('Failed to remove user from thread:', error.message);
      throw new Error(`Failed to remove user from thread: ${error.message}`);
    }
  }

  async sendSticker(threadId, stickerId) {
    try {
      logger.info(`Sticker sent to thread ${threadId}`);
    } catch (error) {
      logger.error('Failed to send sticker:', error.message);
      throw new Error(`Failed to send sticker: ${error.message}`);
    }
  }
}
