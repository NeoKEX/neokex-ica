import logger from './Logger.js';
import { sleep } from './utils.js';
import { readFileSync, writeFileSync, unlinkSync, existsSync } from 'fs';
import sharp from 'sharp';
import axios from 'axios';

export default class DirectMessageV2 {
  constructor(client) {
    this.client = client;
    this.ig = client.getIgClient();

    this.isPolling = false;
    this.pollingInterval = 5000;

    this.seenMessageIds = new Set();
    this.threadLastItemMap = new Map();
    this.replyHandlers = new Map();

    this.isSeeded = false;
  }

  _parseResult(result) {
    if (!result) return result;
    if (result.payload) {
      return {
        ...result,
        item_id: result.payload.item_id || result.item_id,
        thread_id: result.payload.thread_id || result.thread_id,
        timestamp: result.payload.timestamp || result.timestamp,
      };
    }
    return result;
  }

  async getInbox(options = {}) {
    try {
      const inboxFeed = this.ig.feed.directInbox();
      const threads = await inboxFeed.items();

      return {
        threads,
        has_older: inboxFeed.moreAvailable || false,
        cursor: inboxFeed.cursor || null,
        unseen_count: threads.filter(t => {
          const lastItem = t.items?.[0] || t.last_permanent_item;
          return lastItem && lastItem.user_id &&
            lastItem.user_id.toString() !== this.client.userId;
        }).length,
        pending_requests_total: 0,
      };
    } catch (error) {
      logger.error('Failed to get inbox:', error.message);
      return { threads: [], has_older: false, cursor: null, unseen_count: 0, pending_requests_total: 0 };
    }
  }

  async getFullInbox(maxPages = 5) {
    try {
      const inboxFeed = this.ig.feed.directInbox();
      const allThreads = [];
      let page = 0;

      while (inboxFeed.isMoreAvailable() && page < maxPages) {
        const items = await inboxFeed.items();
        allThreads.push(...items);
        page++;
        await sleep(500);
      }

      return { threads: allThreads, total: allThreads.length };
    } catch (error) {
      logger.error('Failed to get full inbox:', error.message);
      throw new Error(`Failed to get full inbox: ${error.message}`);
    }
  }

  async getUnreadThreads() {
    try {
      const inbox = await this.getInbox();
      const unread = inbox.threads.filter(t => {
        const lastItem = t.items?.[0] || t.last_permanent_item;
        return lastItem && lastItem.user_id &&
          lastItem.user_id.toString() !== this.client.userId;
      });
      return unread;
    } catch (error) {
      logger.error('Failed to get unread threads:', error.message);
      throw new Error(`Failed to get unread threads: ${error.message}`);
    }
  }

  async getThread(threadId, options = {}) {
    try {
      const threadFeed = this.ig.feed.directThread({
        thread_id: threadId,
        oldest_cursor: options.cursor || undefined,
      });
      const items = await threadFeed.items();

      return {
        thread_id: threadId,
        items,
        has_older: threadFeed.isMoreAvailable(),
        cursor: threadFeed.cursor || null,
        users: [],
      };
    } catch (error) {
      logger.error('Failed to get thread:', error.message);
      throw new Error(`Failed to get thread: ${error.message}`);
    }
  }

  async getThreadMessages(threadId, limit = 20) {
    try {
      const threadFeed = this.ig.feed.directThread({ thread_id: threadId });
      const items = await threadFeed.items();
      return items.slice(0, limit);
    } catch (error) {
      logger.error('Failed to get thread messages:', error.message);
      throw new Error(`Failed to get thread messages: ${error.message}`);
    }
  }

  async getThreadParticipants(threadId) {
    try {
      const inbox = await this.getInbox();
      const thread = inbox.threads.find(t => t.thread_id === threadId);
      if (thread) {
        return thread.users || [];
      }
      throw new Error('Thread not found in inbox');
    } catch (error) {
      logger.error('Failed to get thread participants:', error.message);
      throw new Error(`Failed to get thread participants: ${error.message}`);
    }
  }

  async getThreadIdByUsername(username) {
    try {
      const userId = await this.ig.user.getIdByUsername(username);
      const inbox = await this.getInbox();
      const thread = inbox.threads.find(t =>
        t.users && t.users.some(u => u.pk.toString() === userId.toString())
      );
      if (thread) return thread.thread_id;

      const newThread = await this.ig.entity.directThread([userId.toString()]);
      return newThread.threadId || null;
    } catch (error) {
      logger.error('Failed to get thread by username:', error.message);
      throw new Error(`Failed to get thread by username: ${error.message}`);
    }
  }

  async createThread(userIds) {
    try {
      const ids = (Array.isArray(userIds) ? userIds : [userIds]).map(String);
      const thread = await this.ig.direct.createGroupThread(ids);
      logger.info(`Thread created with users: ${ids.join(', ')}`);
      return thread;
    } catch (error) {
      logger.error('Failed to create thread:', error.message);
      throw new Error(`Failed to create thread: ${error.message}`);
    }
  }

  async sendMessage(threadId, text, options = {}) {
    try {
      let raw;

      if (options.replyToItemId) {
        raw = await this.ig.entity.directThread(threadId).broadcastText(text, {
          replyToMessageId: options.replyToItemId,
        });
      } else {
        raw = await this.ig.entity.directThread(threadId).broadcastText(text);
      }

      const result = this._parseResult(raw);
      const itemId = result.item_id || result.payload?.item_id;

      if (itemId) {
        this.seenMessageIds.add(itemId);
        this._trimSeenIds();
      }

      logger.info(`Message sent to thread ${threadId} (item: ${itemId})`);

      return {
        ...result,
        item_id: itemId,
        thread_id: result.thread_id || result.payload?.thread_id || threadId,
        text,
        timestamp: result.timestamp || result.payload?.timestamp || Date.now().toString(),
        status: 'sent',
      };
    } catch (error) {
      logger.error('Failed to send message:', error.message);
      throw new Error(`Failed to send message: ${error.message}`);
    }
  }

  async sendMessageToUser(userId, text, options = {}) {
    try {
      const id = userId.toString();
      const raw = await this.ig.entity.directThread([id]).broadcastText(text);
      const result = this._parseResult(raw);
      const itemId = result.item_id || result.payload?.item_id;

      if (itemId) {
        this.seenMessageIds.add(itemId);
        this._trimSeenIds();
      }

      logger.info(`Message sent to user ${userId} (item: ${itemId})`);

      return {
        ...result,
        item_id: itemId,
        thread_id: result.thread_id || result.payload?.thread_id,
        text,
        timestamp: result.timestamp || result.payload?.timestamp || Date.now().toString(),
        status: 'sent',
      };
    } catch (error) {
      logger.error('Failed to send message to user:', error.message);
      throw new Error(`Failed to send message to user: ${error.message}`);
    }
  }

  async sendMessageBulk(threadIds, text, delayBetween = 1000) {
    const results = [];
    for (const threadId of threadIds) {
      try {
        const result = await this.sendMessage(threadId, text);
        results.push({ threadId, success: true, result });
        if (delayBetween > 0 && threadId !== threadIds[threadIds.length - 1]) {
          await sleep(delayBetween);
        }
      } catch (error) {
        results.push({ threadId, success: false, error: error.message });
      }
    }
    return results;
  }

  async scheduleMessage(threadId, text, delayMs, options = {}) {
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        try {
          const result = await this.sendMessage(threadId, text, options);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }, delayMs);
    });
  }

  async sendMessageWithReply(threadId, text, onReplyCallback, options = {}) {
    const timeout = options.replyTimeout || 120000;
    const result = await this.sendMessage(threadId, text, options);

    if (result && result.item_id && onReplyCallback) {
      this.registerReplyHandler(result.item_id, onReplyCallback, timeout);
    }

    return result;
  }

  async sendMessageToUserWithReply(userId, text, onReplyCallback, options = {}) {
    const timeout = options.replyTimeout || 120000;
    const result = await this.sendMessageToUser(userId, text, options);

    if (result && result.item_id && onReplyCallback) {
      this.registerReplyHandler(result.item_id, onReplyCallback, timeout);
    }

    return result;
  }

  registerReplyHandler(itemId, callback, timeout = 120000) {
    this.replyHandlers.set(itemId, { callback, timestamp: Date.now() });
    setTimeout(() => {
      if (this.replyHandlers.has(itemId)) {
        this.replyHandlers.delete(itemId);
        logger.debug(`Reply handler for ${itemId} expired`);
      }
    }, timeout);
    logger.debug(`Reply handler registered for message ${itemId}`);
  }

  clearReplyHandler(itemId) {
    if (this.replyHandlers.has(itemId)) {
      this.replyHandlers.delete(itemId);
      return true;
    }
    return false;
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

  async markAllThreadsSeen() {
    try {
      const inbox = await this.getInbox();
      let marked = 0;
      for (const thread of inbox.threads) {
        const lastItem = thread.items?.[0];
        if (lastItem && lastItem.item_id) {
          try {
            await this.markAsSeen(thread.thread_id, lastItem.item_id);
            marked++;
            await sleep(200);
          } catch (e) {
            /* skip individual failures */
          }
        }
      }
      logger.info(`Marked ${marked} threads as seen`);
      return { marked };
    } catch (error) {
      logger.error('Failed to mark all threads seen:', error.message);
      throw new Error(`Failed to mark all threads seen: ${error.message}`);
    }
  }

  async searchMessages(threadId, query) {
    try {
      const thread = await this.getThread(threadId);
      const q = query.toLowerCase();
      const matches = thread.items.filter(item =>
        item.text && item.text.toLowerCase().includes(q)
      );
      return matches;
    } catch (error) {
      logger.error('Failed to search messages:', error.message);
      throw new Error(`Failed to search messages: ${error.message}`);
    }
  }

  async getPendingInbox() {
    try {
      const pendingFeed = this.ig.feed.directPending();
      const threads = await pendingFeed.items();
      return { threads, has_older: pendingFeed.moreAvailable };
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

  async declineThread(threadId) {
    try {
      await this.ig.entity.directThread(threadId).decline();
      logger.info(`Thread ${threadId} declined`);
    } catch (error) {
      logger.error('Failed to decline thread:', error.message);
      throw new Error(`Failed to decline thread: ${error.message}`);
    }
  }

  async sendPhoto(threadId, photoPath) {
    const maxRetries = 3;
    let lastError = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        logger.info(`Sending photo (attempt ${attempt}/${maxRetries})...`);

        const originalBuffer = readFileSync(photoPath);
        let processedBuffer;

        try {
          const image = sharp(originalBuffer);
          const metadata = await image.metadata();
          let resizeOptions = {};

          if (metadata.width > 1080 || metadata.height > 1080) {
            resizeOptions = { width: 1080, height: 1080, fit: 'inside', withoutEnlargement: true };
            logger.info(`Resizing image from ${metadata.width}x${metadata.height} to fit 1080px`);
          }

          processedBuffer = await image
            .resize(resizeOptions.width ? resizeOptions : undefined)
            .jpeg({ quality: 85, mozjpeg: true })
            .toBuffer();

          const sizeInMB = processedBuffer.length / (1024 * 1024);
          if (sizeInMB > 8) {
            processedBuffer = await sharp(originalBuffer)
              .resize(resizeOptions.width ? resizeOptions : undefined)
              .jpeg({ quality: 70, mozjpeg: true })
              .toBuffer();
          }
        } catch (e) {
          processedBuffer = originalBuffer;
        }

        const raw = await this.ig.entity.directThread(threadId).broadcastPhoto({ file: processedBuffer });
        const result = this._parseResult(raw);
        const itemId = result.item_id;
        if (itemId) { this.seenMessageIds.add(itemId); this._trimSeenIds(); }

        logger.success(`Photo sent to thread ${threadId}`);
        return result;
      } catch (error) {
        lastError = error;
        const msg = error.message || String(error);
        const retryable = ['503', '502', '500', '429', 'unavailable', 'throttle'].some(s => msg.includes(s));

        if (retryable && attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
          logger.warn(`Retrying photo send in ${(delay / 1000).toFixed(1)}s...`);
          await sleep(delay);
        } else {
          throw new Error(`Failed to send photo: ${msg}`);
        }
      }
    }
    throw new Error(`Failed to send photo after ${maxRetries} attempts: ${lastError?.message}`);
  }

  async sendPhotoWithCaption(threadId, photoPath, caption = '') {
    const result = await this.sendPhoto(threadId, photoPath);
    if (caption) {
      await sleep(300);
      await this.sendMessage(threadId, caption);
    }
    return result;
  }

  async sendVideo(threadId, videoPath, options = {}) {
    try {
      const videoBuffer = readFileSync(videoPath);
      const raw = await this.ig.entity.directThread(threadId).broadcastVideo({ video: videoBuffer });
      const result = this._parseResult(raw);
      const itemId = result.item_id;
      if (itemId) { this.seenMessageIds.add(itemId); this._trimSeenIds(); }
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
      const raw = await this.ig.entity.directThread(threadId).broadcastVoice({ file: audioBuffer });
      const result = this._parseResult(raw);
      const itemId = result.item_id;
      if (itemId) { this.seenMessageIds.add(itemId); this._trimSeenIds(); }
      logger.info(`Voice note sent to thread ${threadId}`);
      return result;
    } catch (error) {
      logger.error('Failed to send voice note:', error.message);
      throw new Error(`Failed to send voice note: ${error.message}`);
    }
  }

  async sendSticker(threadId, stickerId) {
    try {
      const raw = await this.ig.entity.directThread(threadId).broadcastSticker({ sticker_id: stickerId });
      const result = this._parseResult(raw);
      const itemId = result.item_id;
      if (itemId) { this.seenMessageIds.add(itemId); this._trimSeenIds(); }
      logger.info(`Sticker sent to thread ${threadId}`);
      return result;
    } catch (error) {
      logger.error('Failed to send sticker:', error.message);
      throw new Error(`Failed to send sticker: ${error.message}`);
    }
  }

  async sendGif(threadId, giphyId) {
    try {
      const raw = await this.ig.entity.directThread(threadId).broadcastGiphy({ giphy_id: giphyId });
      const result = this._parseResult(raw);
      const itemId = result.item_id;
      if (itemId) { this.seenMessageIds.add(itemId); this._trimSeenIds(); }
      logger.info(`GIF sent to thread ${threadId}`);
      return result;
    } catch (error) {
      logger.error('Failed to send GIF:', error.message);
      throw new Error(`Failed to send GIF: ${error.message}`);
    }
  }

  async sendAnimatedMedia(threadId, mediaId) {
    try {
      const raw = await this.ig.entity.directThread(threadId).broadcastAnimatedMedia({ media_id: mediaId });
      const result = this._parseResult(raw);
      const itemId = result.item_id;
      if (itemId) { this.seenMessageIds.add(itemId); this._trimSeenIds(); }
      logger.info(`Animated media sent to thread ${threadId}`);
      return result;
    } catch (error) {
      logger.error('Failed to send animated media:', error.message);
      throw new Error(`Failed to send animated media: ${error.message}`);
    }
  }

  async shareMediaToThread(threadId, mediaId, message = '') {
    try {
      const raw = await this.ig.entity.directThread(threadId).broadcastMediaShare({
        media_id: mediaId,
        text: message,
      });
      const result = this._parseResult(raw);
      const itemId = result.item_id;
      if (itemId) { this.seenMessageIds.add(itemId); this._trimSeenIds(); }
      logger.info(`Media shared to thread ${threadId}`);
      return result;
    } catch (error) {
      logger.error('Failed to share media:', error.message);
      throw new Error(`Failed to share media: ${error.message}`);
    }
  }

  async sendLink(threadId, linkUrl, linkText = '') {
    try {
      const raw = await this.ig.entity.directThread(threadId).broadcastLink(linkUrl, linkText);
      const result = this._parseResult(raw);
      const itemId = result.item_id;
      if (itemId) { this.seenMessageIds.add(itemId); this._trimSeenIds(); }
      logger.info(`Link sent to thread ${threadId}`);
      return result;
    } catch (error) {
      logger.error('Failed to send link:', error.message);
      throw new Error(`Failed to send link: ${error.message}`);
    }
  }

  async sendPhotoFromUrl(threadId, photoUrl) {
    let tempFile = null;
    try {
      const response = await axios.get(photoUrl, {
        responseType: 'arraybuffer',
        timeout: 30000,
        headers: { 'User-Agent': 'Mozilla/5.0' },
      });
      tempFile = `/tmp/photo_${Date.now()}.jpg`;
      writeFileSync(tempFile, response.data);
      const result = await this.sendPhoto(threadId, tempFile);
      try { unlinkSync(tempFile); } catch (_) { }
      return result;
    } catch (error) {
      if (tempFile) try { unlinkSync(tempFile); } catch (_) { }
      logger.error('Failed to send photo from URL:', error.message);
      throw new Error(`Failed to send photo from URL: ${error.message}`);
    }
  }

  async sendVideoFromUrl(threadId, videoUrl) {
    let tempFile = null;
    try {
      const response = await axios.get(videoUrl, {
        responseType: 'arraybuffer',
        timeout: 60000,
        headers: { 'User-Agent': 'Mozilla/5.0' },
      });
      tempFile = `/tmp/video_${Date.now()}.mp4`;
      writeFileSync(tempFile, response.data);
      const result = await this.sendVideo(threadId, tempFile);
      try { unlinkSync(tempFile); } catch (_) { }
      return result;
    } catch (error) {
      if (tempFile) try { unlinkSync(tempFile); } catch (_) { }
      logger.error('Failed to send video from URL:', error.message);
      throw new Error(`Failed to send video from URL: ${error.message}`);
    }
  }

  async getMessageMediaUrl(threadId, itemId) {
    try {
      const thread = await this.getThread(threadId);
      const message = thread.items.find(item => item.item_id === itemId);

      if (!message) throw new Error(`Message ${itemId} not found`);

      const mediaUrls = { item_id: itemId, item_type: message.item_type, media: null };

      if (message.media) {
        mediaUrls.media = { id: message.media.id, media_type: message.media.media_type };
        if (message.media.image_versions2) {
          mediaUrls.media.images = message.media.image_versions2.candidates.map(img => ({
            url: img.url, width: img.width, height: img.height,
          }));
        }
        if (message.media.video_versions) {
          mediaUrls.media.videos = message.media.video_versions.map(vid => ({
            url: vid.url, width: vid.width, height: vid.height, type: vid.type,
          }));
        }
        if (message.media.carousel_media) {
          mediaUrls.media.carousel = message.media.carousel_media.map(item => {
            const c = { id: item.id };
            if (item.image_versions2) c.images = item.image_versions2.candidates;
            if (item.video_versions) c.videos = item.video_versions;
            return c;
          });
        }
      }

      return mediaUrls;
    } catch (error) {
      logger.error('Failed to get media URL:', error.message);
      throw new Error(`Failed to get media URL: ${error.message}`);
    }
  }

  async downloadMessageMedia(threadId, itemId, savePath = null) {
    try {
      const mediaInfo = await this.getMessageMediaUrl(threadId, itemId);
      if (!mediaInfo.media) throw new Error('No media in this message');

      let downloadUrl = null;
      let ext = 'jpg';

      if (mediaInfo.media.videos?.length > 0) {
        downloadUrl = mediaInfo.media.videos[0].url;
        ext = 'mp4';
      } else if (mediaInfo.media.images?.length > 0) {
        downloadUrl = mediaInfo.media.images[0].url;
      } else {
        throw new Error('No downloadable URL found');
      }

      const response = await axios.get(downloadUrl, {
        responseType: 'arraybuffer',
        timeout: 60000,
        headers: { 'User-Agent': 'Mozilla/5.0' },
      });

      const finalPath = savePath || `/tmp/media_${Date.now()}.${ext}`;
      writeFileSync(finalPath, response.data);

      logger.success(`Media downloaded to ${finalPath}`);
      return { path: finalPath, size: response.data.length, type: ext, url: downloadUrl };
    } catch (error) {
      logger.error('Failed to download media:', error.message);
      throw new Error(`Failed to download media: ${error.message}`);
    }
  }

  async forwardMessage(fromThreadId, toThreadId, itemId) {
    try {
      const mediaInfo = await this.getMessageMediaUrl(fromThreadId, itemId);
      if (mediaInfo.media) {
        if (mediaInfo.media.videos) return await this.sendVideoFromUrl(toThreadId, mediaInfo.media.videos[0].url);
        if (mediaInfo.media.images) return await this.sendPhotoFromUrl(toThreadId, mediaInfo.media.images[0].url);
      }
      throw new Error('Cannot forward this message type');
    } catch (error) {
      logger.error('Failed to forward message:', error.message);
      throw new Error(`Failed to forward message: ${error.message}`);
    }
  }

  async sendReaction(threadId, itemId, emoji) {
    try {
      await this.ig.entity.directThread(threadId).broadcastReaction({
        item_id: itemId,
        emoji_type: 'emoji',
        reaction: emoji,
      });
      logger.info(`Reaction sent to message ${itemId}`);
    } catch (error) {
      logger.error('Failed to send reaction:', error.message);
      throw new Error(`Failed to send reaction: ${error.message}`);
    }
  }

  async removeReaction(threadId, itemId) {
    try {
      await this.ig.entity.directThread(threadId).deleteReaction({ item_id: itemId });
      logger.info(`Reaction removed from message ${itemId}`);
    } catch (error) {
      logger.error('Failed to remove reaction:', error.message);
      throw new Error(`Failed to remove reaction: ${error.message}`);
    }
  }

  async unsendMessage(threadId, itemId) {
    try {
      await this.ig.entity.directThread(threadId).deleteItem(itemId);
      this.replyHandlers.delete(itemId);
      logger.info(`Message ${itemId} unsent`);
    } catch (error) {
      logger.error('Failed to unsend message:', error.message);
      throw new Error(`Failed to unsend message: ${error.message}`);
    }
  }

  async editMessage(threadId, itemId, newText) {
    try {
      await this.ig.entity.directThread(threadId).editMessage(itemId, newText);
      logger.info(`Message ${itemId} edited`);
      return { success: true, item_id: itemId, new_text: newText };
    } catch (error) {
      logger.error('Failed to edit message:', error.message);
      throw new Error(`Failed to edit message: ${error.message}`);
    }
  }

  async indicateTyping(threadId, isTyping = true) {
    try {
      if (isTyping) {
        await this.ig.entity.directThread(threadId).broadcastTypingIndicator();
      }
      logger.debug(`Typing ${isTyping ? 'started' : 'stopped'} for ${threadId}`);
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
      logger.info(`Thread ${threadId} hidden/deleted`);
    } catch (error) {
      logger.error('Failed to delete thread:', error.message);
      throw new Error(`Failed to delete thread: ${error.message}`);
    }
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
      await this.ig.entity.directThread(threadId).unhide();
      logger.info(`Thread ${threadId} unarchived`);
    } catch (error) {
      logger.error('Failed to unarchive thread:', error.message);
      throw new Error(`Failed to unarchive thread: ${error.message}`);
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
      const ids = (Array.isArray(userIds) ? userIds : [userIds]).map(String);
      await this.ig.entity.directThread(threadId).addUser(ids);
      logger.info(`Added users to thread ${threadId}`);
    } catch (error) {
      logger.error('Failed to add users:', error.message);
      throw new Error(`Failed to add users: ${error.message}`);
    }
  }

  async removeUserFromThread(threadId, userId) {
    try {
      await this.ig.entity.directThread(threadId).removeUser(userId.toString());
      logger.info(`User ${userId} removed from thread ${threadId}`);
    } catch (error) {
      logger.error('Failed to remove user:', error.message);
      throw new Error(`Failed to remove user: ${error.message}`);
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
        if (thread.items) messages.push(...thread.items.slice(0, Math.ceil(limit / 5)));
      }
      return messages.slice(0, limit);
    } catch (error) {
      logger.error('Failed to get recent messages:', error.message);
      throw new Error(`Failed to get recent messages: ${error.message}`);
    }
  }

  _trimSeenIds() {
    if (this.seenMessageIds.size > 10000) {
      const toDelete = Array.from(this.seenMessageIds).slice(0, 5000);
      toDelete.forEach(id => this.seenMessageIds.delete(id));
    }
  }

  async _seedSeenIds() {
    try {
      logger.info('Seeding seen message IDs from inbox (prevents duplicate events)...');
      const inbox = await this.getInbox();
      for (const thread of inbox.threads) {
        if (thread.items) {
          for (const item of thread.items) {
            if (item?.item_id) this.seenMessageIds.add(item.item_id);
          }
        }
        const lastItem = thread.last_permanent_item;
        if (lastItem?.item_id) {
          this.seenMessageIds.add(lastItem.item_id);
          this.threadLastItemMap.set(thread.thread_id, lastItem.item_id);
        }
      }
      this.isSeeded = true;
      logger.info(`Seeded ${this.seenMessageIds.size} existing message IDs`);
    } catch (error) {
      logger.warn('Could not seed message IDs:', error.message);
      this.isSeeded = true;
    }
  }

  async startPolling(interval = 5000) {
    if (this.isPolling) {
      logger.warn('Polling already active');
      return;
    }

    this.isPolling = true;
    this.pollingInterval = interval;

    await this._seedSeenIds();

    logger.event(`Started message polling (interval: ${interval}ms)`);
    this.client.emit('polling:start');

    while (this.isPolling) {
      try {
        await this._pollCycle();
        await sleep(interval);
      } catch (error) {
        logger.error('Polling error:', error.message);
        this.client.emit('error', error);
        await sleep(interval * 2);
      }
    }

    logger.event('Message polling stopped');
    this.client.emit('polling:stop');
  }

  async _pollCycle() {
    const inbox = await this.getInbox();

    if (!inbox.threads) return;

    for (const thread of inbox.threads) {
      const threadId = thread.thread_id;
      const lastPermanentItem = thread.last_permanent_item;

      if (!lastPermanentItem?.item_id) continue;

      const prevLastId = this.threadLastItemMap.get(threadId);

      if (prevLastId === lastPermanentItem.item_id) continue;

      this.threadLastItemMap.set(threadId, lastPermanentItem.item_id);

      const itemsToProcess = thread.items || [];

      for (const item of itemsToProcess) {
        if (!item?.item_id) continue;
        if (this.seenMessageIds.has(item.item_id)) continue;

        this.seenMessageIds.add(item.item_id);
        this._trimSeenIds();

        const isFromMe = item.user_id && item.user_id.toString() === this.client.userId;

        const messageEvent = {
          thread_id: threadId,
          item_id: item.item_id,
          user_id: item.user_id,
          text: item.text || '',
          timestamp: item.timestamp,
          message: item,
          is_from_me: isFromMe,
          thread_title: thread.thread_title || null,
          thread_users: thread.users || [],
        };

        if (item.replied_to_message) {
          messageEvent.messageReply = {
            item_id: item.replied_to_message.item_id,
            text: item.replied_to_message.text || '',
            user_id: item.replied_to_message.user_id,
            timestamp: item.replied_to_message.timestamp,
          };

          const handler = this.replyHandlers.get(item.replied_to_message.item_id);
          if (handler) {
            try {
              await handler.callback(messageEvent);
              this.replyHandlers.delete(item.replied_to_message.item_id);
            } catch (err) {
              logger.error('Reply handler error:', err.message);
            }
          }
        }

        this.client.emit('message', messageEvent);

        if (!isFromMe) {
          logger.debug(`New message in ${threadId} from ${item.user_id}: ${item.text || '(media)'}`);
        }
      }
    }

    const pending = await this.getPendingInbox().catch(() => ({ threads: [] }));
    if (pending.threads?.length > 0) {
      this.client.emit('pending_request', {
        count: pending.threads.length,
        threads: pending.threads,
      });
    }
  }

  stopPolling() {
    this.isPolling = false;
    logger.event('Stopping message polling...');
  }
}
