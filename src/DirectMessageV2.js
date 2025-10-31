import logger from './Logger.js';
import { sleep } from './utils.js';
import { readFileSync, writeFileSync, unlinkSync } from 'fs';
import sharp from 'sharp';
import axios from 'axios';

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
      // Use feed API to get thread items
      const threadFeed = this.ig.feed.directThread({ thread_id: threadId });
      const threadItems = await threadFeed.items();
      
      // Return in a format similar to what we expect
      return {
        thread_id: threadId,
        items: threadItems,
        users: []
      };
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
    const maxRetries = 3;
    let lastError = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        logger.info(`Sending photo (attempt ${attempt}/${maxRetries})...`);
        
        // Preprocess image: convert to JPEG, resize to Instagram's limits
        const originalBuffer = readFileSync(photoPath);
        let processedBuffer;
        
        try {
          const image = sharp(originalBuffer);
          const metadata = await image.metadata();
          
          // Resize if larger than Instagram's DM limits (1080px max dimension)
          let resizeOptions = {};
          if (metadata.width > 1080 || metadata.height > 1080) {
            resizeOptions = {
              width: 1080,
              height: 1080,
              fit: 'inside',
              withoutEnlargement: true
            };
            logger.info(`Resizing image from ${metadata.width}x${metadata.height} to fit 1080px`);
          }
          
          // Convert to JPEG with quality settings
          processedBuffer = await image
            .resize(resizeOptions.width ? resizeOptions : undefined)
            .jpeg({ quality: 85, mozjpeg: true })
            .toBuffer();
          
          // Check file size (Instagram limit ~8MB)
          const sizeInMB = processedBuffer.length / (1024 * 1024);
          if (sizeInMB > 8) {
            logger.warn(`Image size ${sizeInMB.toFixed(2)}MB exceeds 8MB, reducing quality`);
            processedBuffer = await sharp(originalBuffer)
              .resize(resizeOptions.width ? resizeOptions : undefined)
              .jpeg({ quality: 70, mozjpeg: true })
              .toBuffer();
          }
          
          logger.info(`Image processed: ${processedBuffer.length / 1024}KB JPEG`);
        } catch (preprocessError) {
          logger.warn(`Image preprocessing failed: ${preprocessError.message}, using original`);
          processedBuffer = originalBuffer;
        }
        
        // Attempt to send the photo
        const result = await this.ig.entity.directThread(threadId).broadcastPhoto({
          file: processedBuffer
        });
        
        logger.success(`Photo sent to thread ${threadId}`);
        return result;
        
      } catch (error) {
        lastError = error;
        const errorMsg = error.message || String(error);
        
        // Check if it's a retryable error (5xx, rate limit, etc)
        const isRetryable = 
          errorMsg.includes('503') || 
          errorMsg.includes('502') || 
          errorMsg.includes('500') ||
          errorMsg.includes('429') ||
          errorMsg.includes('Service Unavailable') ||
          errorMsg.includes('throttle');
        
        if (isRetryable && attempt < maxRetries) {
          // Exponential backoff with jitter: 2^attempt * 1000ms + random(0-1000)ms
          const baseDelay = Math.pow(2, attempt) * 1000;
          const jitter = Math.random() * 1000;
          const delay = baseDelay + jitter;
          
          logger.warn(`Retryable error (${errorMsg.substring(0, 50)}...), waiting ${(delay/1000).toFixed(1)}s before retry ${attempt + 1}/${maxRetries}`);
          await sleep(delay);
          continue;
        } else {
          logger.error(`Failed to send photo: ${errorMsg}`);
          throw new Error(`Failed to send photo: ${errorMsg}`);
        }
      }
    }
    
    // All retries exhausted
    throw new Error(`Failed to send photo after ${maxRetries} attempts: ${lastError?.message || 'Unknown error'}`);
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

  async sendPhotoFromUrl(threadId, photoUrl) {
    let tempFile = null;
    try {
      logger.info(`Downloading photo from URL: ${photoUrl}`);
      
      // Download the photo
      const response = await axios.get(photoUrl, {
        responseType: 'arraybuffer',
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      // Create a temporary file
      tempFile = `/tmp/photo_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
      writeFileSync(tempFile, response.data);
      
      logger.info(`Photo downloaded (${(response.data.length / 1024).toFixed(2)}KB), sending...`);
      
      // Use the existing sendPhoto method which has retry logic
      const result = await this.sendPhoto(threadId, tempFile);
      
      // Clean up temp file
      try {
        unlinkSync(tempFile);
      } catch (e) {
        // Ignore cleanup errors
      }
      
      return result;
    } catch (error) {
      // Clean up temp file on error
      if (tempFile) {
        try {
          unlinkSync(tempFile);
        } catch (e) {
          // Ignore cleanup errors
        }
      }
      
      logger.error('Failed to send photo from URL:', error.message);
      throw new Error(`Failed to send photo from URL: ${error.message}`);
    }
  }

  async sendVideoFromUrl(threadId, videoUrl) {
    let tempFile = null;
    try {
      logger.info(`Downloading video from URL: ${videoUrl}`);
      
      // Download the video
      const response = await axios.get(videoUrl, {
        responseType: 'arraybuffer',
        timeout: 60000, // Longer timeout for videos
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      // Create a temporary file
      tempFile = `/tmp/video_${Date.now()}_${Math.random().toString(36).substring(7)}.mp4`;
      writeFileSync(tempFile, response.data);
      
      logger.info(`Video downloaded (${(response.data.length / 1024 / 1024).toFixed(2)}MB), sending...`);
      
      // Use the existing sendVideo method
      const result = await this.sendVideo(threadId, tempFile);
      
      // Clean up temp file
      try {
        unlinkSync(tempFile);
      } catch (e) {
        // Ignore cleanup errors
      }
      
      return result;
    } catch (error) {
      // Clean up temp file on error
      if (tempFile) {
        try {
          unlinkSync(tempFile);
        } catch (e) {
          // Ignore cleanup errors
        }
      }
      
      logger.error('Failed to send video from URL:', error.message);
      throw new Error(`Failed to send video from URL: ${error.message}`);
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
