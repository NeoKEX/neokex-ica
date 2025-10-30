import { generateUUID, sleep } from './utils.js';
import logger from './Logger.js';

export default class DirectMessage {
  constructor(client) {
    this.client = client;
    this.inbox = null;
    this.lastSeqId = 0;
    this.isPolling = false;
  }

  async getInbox() {
    const data = await this.client.request('/direct_v2/inbox/');
    this.inbox = data.inbox;
    return data.inbox;
  }

  async getThread(threadId) {
    const data = await this.client.request(`/direct_v2/threads/${threadId}/`);
    return data.thread;
  }

  async sendMessage(threadId, text) {
    const clientContext = generateUUID();
    
    const payload = new URLSearchParams({
      recipient_users: '[]',
      action: 'send_item',
      is_shh_mode: '0',
      send_attribution: 'inbox',
      client_context: clientContext,
      device_id: this.client.deviceId,
      mutation_token: clientContext,
      nav_chain: '',
      offline_threading_id: clientContext,
      text: text,
      thread_ids: `["${threadId}"]`,
    });

    const data = await this.client.request(
      '/direct_v2/threads/broadcast/text/',
      'POST',
      payload.toString()
    );

    return data;
  }

  async sendMessageToUser(userId, text) {
    const clientContext = generateUUID();
    
    const payload = new URLSearchParams({
      recipient_users: JSON.stringify([[userId.toString()]]),
      action: 'send_item',
      is_shh_mode: '0',
      send_attribution: 'inbox',
      client_context: clientContext,
      device_id: this.client.deviceId,
      mutation_token: clientContext,
      nav_chain: '',
      offline_threading_id: clientContext,
      text: text,
    });

    const data = await this.client.request(
      '/direct_v2/threads/broadcast/text/',
      'POST',
      payload.toString()
    );

    return data;
  }

  async markAsSeen(threadId, itemId) {
    const payload = new URLSearchParams({
      action: 'mark_seen',
      thread_id: threadId,
      item_id: itemId,
    });

    await this.client.request(
      `/direct_v2/threads/${threadId}/items/${itemId}/seen/`,
      'POST',
      payload.toString()
    );
  }

  async getPendingInbox() {
    const data = await this.client.request('/direct_v2/pending_inbox/');
    return data.inbox;
  }

  async approveThread(threadId) {
    const payload = new URLSearchParams({
      filter: 'DEFAULT',
    });

    await this.client.request(
      `/direct_v2/threads/${threadId}/approve/`,
      'POST',
      payload.toString()
    );
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
              const latestItem = thread.items[0];
              
              if (latestItem.user_id !== this.client.userId) {
                if (!this.lastSeqId || latestItem.timestamp > this.lastSeqId) {
                  this.lastSeqId = latestItem.timestamp;
                  
                  const username = thread.users?.find(u => u.pk === latestItem.user_id)?.username || latestItem.user_id;
                  logger.message(username, latestItem.text || '[non-text message]');
                  
                  this.client.emit('message', {
                    threadId: thread.thread_id,
                    itemId: latestItem.item_id,
                    userId: latestItem.user_id,
                    text: latestItem.text || '',
                    timestamp: latestItem.timestamp,
                    thread: thread,
                    item: latestItem,
                  });
                }
              }
              
              if (latestItem.item_type === 'action_log' && latestItem.action_log) {
                if (latestItem.action_log.description && latestItem.action_log.description.includes('typing')) {
                  this.client.emit('typing', {
                    threadId: thread.thread_id,
                    userId: latestItem.user_id,
                    isTyping: true,
                  });
                }
              }
            }
          }
        }

        const pendingInbox = await this.getPendingInbox();
        if (pendingInbox.threads && pendingInbox.threads.length > 0) {
          logger.event(`${pendingInbox.threads.length} pending message request(s)`);
          this.client.emit('pending_request', {
            threads: pendingInbox.threads,
          });
        }

      } catch (error) {
        this.client.emit('error', error);
      }

      await sleep(interval);
    }
  }

  stopPolling() {
    this.isPolling = false;
    logger.event('Stopped message polling');
    this.client.emit('polling:stop');
  }

  async getRecentMessages(limit = 20) {
    const inbox = await this.getInbox();
    const messages = [];

    if (inbox.threads) {
      for (const thread of inbox.threads.slice(0, limit)) {
        if (thread.items && thread.items.length > 0) {
          for (const item of thread.items) {
            messages.push({
              threadId: thread.thread_id,
              itemId: item.item_id,
              userId: item.user_id,
              text: item.text || '',
              timestamp: item.timestamp,
              threadTitle: thread.thread_title,
            });
          }
        }
      }
    }

    return messages;
  }

  async sendPhoto(threadId, photoUrl) {
    const clientContext = generateUUID();
    
    const payload = new URLSearchParams({
      recipient_users: '[]',
      action: 'send_item',
      client_context: clientContext,
      device_id: this.client.deviceId,
      mutation_token: clientContext,
      photo_url: photoUrl,
      thread_ids: `["${threadId}"]`,
    });

    const data = await this.client.request(
      '/direct_v2/threads/broadcast/configure_photo/',
      'POST',
      payload.toString()
    );

    return data;
  }

  async sendVideo(threadId, videoUrl) {
    const clientContext = generateUUID();
    
    const payload = new URLSearchParams({
      recipient_users: '[]',
      action: 'send_item',
      client_context: clientContext,
      device_id: this.client.deviceId,
      mutation_token: clientContext,
      video_url: videoUrl,
      thread_ids: `["${threadId}"]`,
    });

    const data = await this.client.request(
      '/direct_v2/threads/broadcast/configure_video/',
      'POST',
      payload.toString()
    );

    return data;
  }

  async sendVoiceNote(threadId, audioUrl) {
    const clientContext = generateUUID();
    
    const payload = new URLSearchParams({
      recipient_users: '[]',
      action: 'send_item',
      client_context: clientContext,
      device_id: this.client.deviceId,
      mutation_token: clientContext,
      upload_id: generateUUID(),
      voice_url: audioUrl,
      thread_ids: `["${threadId}"]`,
    });

    const data = await this.client.request(
      '/direct_v2/threads/broadcast/voice/',
      'POST',
      payload.toString()
    );

    return data;
  }

  async sendSticker(threadId, stickerId) {
    const clientContext = generateUUID();
    
    const payload = new URLSearchParams({
      recipient_users: '[]',
      action: 'send_item',
      client_context: clientContext,
      device_id: this.client.deviceId,
      mutation_token: clientContext,
      sticker_id: stickerId,
      thread_ids: `["${threadId}"]`,
    });

    const data = await this.client.request(
      '/direct_v2/threads/broadcast/sticker/',
      'POST',
      payload.toString()
    );

    return data;
  }

  async sendLink(threadId, linkUrl, linkText = '') {
    const clientContext = generateUUID();
    
    const payload = new URLSearchParams({
      recipient_users: '[]',
      action: 'send_item',
      client_context: clientContext,
      device_id: this.client.deviceId,
      mutation_token: clientContext,
      link_urls: JSON.stringify([linkUrl]),
      link_text: linkText,
      thread_ids: `["${threadId}"]`,
    });

    const data = await this.client.request(
      '/direct_v2/threads/broadcast/link/',
      'POST',
      payload.toString()
    );

    return data;
  }

  async sendReaction(threadId, itemId, emoji) {
    const clientContext = generateUUID();
    
    const payload = new URLSearchParams({
      item_type: 'reaction',
      reaction_type: 'like',
      action: 'send_item',
      client_context: clientContext,
      device_id: this.client.deviceId,
      mutation_token: clientContext,
      node_type: 'item',
      item_id: itemId,
      reaction_status: 'created',
      emoji: emoji || '❤️',
    });

    const data = await this.client.request(
      `/direct_v2/threads/${threadId}/items/${itemId}/react/`,
      'POST',
      payload.toString()
    );

    return data;
  }

  async removeReaction(threadId, itemId) {
    const clientContext = generateUUID();
    
    const payload = new URLSearchParams({
      action: 'send_item',
      client_context: clientContext,
      device_id: this.client.deviceId,
      mutation_token: clientContext,
    });

    const data = await this.client.request(
      `/direct_v2/threads/${threadId}/items/${itemId}/unreact/`,
      'POST',
      payload.toString()
    );

    return data;
  }

  async unsendMessage(threadId, itemId) {
    const data = await this.client.request(
      `/direct_v2/threads/${threadId}/items/${itemId}/delete/`,
      'POST',
      new URLSearchParams({}).toString()
    );

    return data;
  }

  async indicateTyping(threadId, isTyping = true) {
    const payload = new URLSearchParams({
      thread_id: threadId,
      is_typing: isTyping ? '1' : '0',
    });

    const data = await this.client.request(
      '/direct_v2/threads/broadcast/activity_indicator/',
      'POST',
      payload.toString()
    );

    return data;
  }

  async muteThread(threadId) {
    const data = await this.client.request(
      `/direct_v2/threads/${threadId}/mute/`,
      'POST',
      new URLSearchParams({}).toString()
    );

    return data;
  }

  async unmuteThread(threadId) {
    const data = await this.client.request(
      `/direct_v2/threads/${threadId}/unmute/`,
      'POST',
      new URLSearchParams({}).toString()
    );

    return data;
  }

  async deleteThread(threadId) {
    const data = await this.client.request(
      `/direct_v2/threads/${threadId}/delete/`,
      'POST',
      new URLSearchParams({}).toString()
    );

    return data;
  }

  async archiveThread(threadId) {
    const data = await this.client.request(
      `/direct_v2/threads/${threadId}/hide/`,
      'POST',
      new URLSearchParams({}).toString()
    );

    return data;
  }

  async unarchiveThread(threadId) {
    const data = await this.client.request(
      `/direct_v2/threads/${threadId}/unhide/`,
      'POST',
      new URLSearchParams({}).toString()
    );

    return data;
  }

  async leaveThread(threadId) {
    const data = await this.client.request(
      `/direct_v2/threads/${threadId}/leave/`,
      'POST',
      new URLSearchParams({}).toString()
    );

    return data;
  }

  async addUsersToThread(threadId, userIds) {
    const payload = new URLSearchParams({
      user_ids: JSON.stringify(userIds),
    });

    const data = await this.client.request(
      `/direct_v2/threads/${threadId}/add_user/`,
      'POST',
      payload.toString()
    );

    return data;
  }

  async removeUserFromThread(threadId, userId) {
    const payload = new URLSearchParams({
      user_id: userId.toString(),
    });

    const data = await this.client.request(
      `/direct_v2/threads/${threadId}/remove_user/`,
      'POST',
      payload.toString()
    );

    return data;
  }

  async updateThreadTitle(threadId, title) {
    const payload = new URLSearchParams({
      title: title,
    });

    const data = await this.client.request(
      `/direct_v2/threads/${threadId}/update_title/`,
      'POST',
      payload.toString()
    );

    return data;
  }
}
