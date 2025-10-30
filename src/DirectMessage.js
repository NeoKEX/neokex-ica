import { generateUUID, sleep } from './utils.js';

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
      console.log('Already polling');
      return;
    }

    this.isPolling = true;
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
            }
          }
        }

        const pendingInbox = await this.getPendingInbox();
        if (pendingInbox.threads && pendingInbox.threads.length > 0) {
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
}
