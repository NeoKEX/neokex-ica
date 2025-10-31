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
    this.seenMessageIds = new Set();
    this.replyHandlers = new Map();
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

  async sendMessage(threadId, text, options = {}) {
    try {
      let result;
      
      if (options.replyToItemId) {
        result = await this.ig.entity.directThread(threadId).broadcastText(text, {
          replyToMessageId: options.replyToItemId
        });
      } else {
        result = await this.ig.entity.directThread(threadId).broadcastText(text);
      }
      
      logger.info(`Message sent to thread ${threadId}`);
      
      if (result && result.item_id) {
        this.seenMessageIds.add(result.item_id);
      }
      
      return result;
    } catch (error) {
      logger.error('Failed to send message:', error.message);
      throw new Error(`Failed to send message: ${error.message}`);
    }
  }

  async sendMessageToUser(userId, text, options = {}) {
    try {
      const userIds = Array.isArray(userId) ? userId : [userId];
      const thread = await this.ig.entity.directThread(userIds.map(id => id.toString()));
      
      let result;
      if (options.replyToItemId) {
        result = await thread.broadcastText(text, {
          replyToMessageId: options.replyToItemId
        });
      } else {
        result = await thread.broadcastText(text);
      }
      
      logger.info(`Message sent to user(s) ${userIds.join(', ')}`);
      
      if (result && result.item_id) {
        this.seenMessageIds.add(result.item_id);
      }
      
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
        timeout: 60000,
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

  async getMessageMediaUrl(threadId, itemId) {
    try {
      const thread = await this.getThread(threadId);
      const message = thread.items.find(item => item.item_id === itemId);
      
      if (!message) {
        throw new Error(`Message ${itemId} not found in thread`);
      }

      const mediaUrls = {
        item_id: itemId,
        item_type: message.item_type,
        media: null
      };

      if (message.media) {
        mediaUrls.media = {
          id: message.media.id,
          media_type: message.media.media_type
        };

        if (message.media.image_versions2) {
          mediaUrls.media.images = message.media.image_versions2.candidates.map(img => ({
            url: img.url,
            width: img.width,
            height: img.height
          }));
        }

        if (message.media.video_versions) {
          mediaUrls.media.videos = message.media.video_versions.map(vid => ({
            url: vid.url,
            width: vid.width,
            height: vid.height,
            type: vid.type
          }));
        }

        if (message.media.carousel_media) {
          mediaUrls.media.carousel = message.media.carousel_media.map(item => {
            const carouselItem = { id: item.id };
            if (item.image_versions2) {
              carouselItem.images = item.image_versions2.candidates;
            }
            if (item.video_versions) {
              carouselItem.videos = item.video_versions;
            }
            return carouselItem;
          });
        }
      }

      logger.info(`Retrieved media URLs for message ${itemId}`);
      return mediaUrls;
    } catch (error) {
      logger.error('Failed to get message media URL:', error.message);
      throw new Error(`Failed to get message media URL: ${error.message}`);
    }
  }

  async downloadMessageMedia(threadId, itemId, savePath = null) {
    try {
      const mediaInfo = await this.getMessageMediaUrl(threadId, itemId);
      
      if (!mediaInfo.media) {
        throw new Error('No media found in this message');
      }

      let downloadUrl = null;
      let fileExtension = 'jpg';

      if (mediaInfo.media.videos && mediaInfo.media.videos.length > 0) {
        downloadUrl = mediaInfo.media.videos[0].url;
        fileExtension = 'mp4';
      } else if (mediaInfo.media.images && mediaInfo.media.images.length > 0) {
        downloadUrl = mediaInfo.media.images[0].url;
        fileExtension = 'jpg';
      } else {
        throw new Error('No downloadable media URL found');
      }

      const response = await axios.get(downloadUrl, {
        responseType: 'arraybuffer',
        timeout: 60000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      const finalPath = savePath || `/tmp/media_${Date.now()}.${fileExtension}`;
      writeFileSync(finalPath, response.data);
      
      logger.success(`Media downloaded to ${finalPath}`);
      return {
        path: finalPath,
        size: response.data.length,
        type: fileExtension,
        url: downloadUrl
      };
    } catch (error) {
      logger.error('Failed to download message media:', error.message);
      throw new Error(`Failed to download message media: ${error.message}`);
    }
  }

  async sendGif(threadId, gifUrl) {
    try {
      const result = await this.ig.entity.directThread(threadId).broadcastGiphy({
        giphy_id: gifUrl
      });
      logger.info(`GIF sent to thread ${threadId}`);
      
      if (result && result.item_id) {
        this.seenMessageIds.add(result.item_id);
      }
      
      return result;
    } catch (error) {
      logger.error('Failed to send GIF:', error.message);
      throw new Error(`Failed to send GIF: ${error.message}`);
    }
  }

  async sendAnimatedMedia(threadId, mediaId) {
    try {
      const result = await this.ig.entity.directThread(threadId).broadcastAnimatedMedia({
        media_id: mediaId
      });
      logger.info(`Animated media sent to thread ${threadId}`);
      
      if (result && result.item_id) {
        this.seenMessageIds.add(result.item_id);
      }
      
      return result;
    } catch (error) {
      logger.error('Failed to send animated media:', error.message);
      throw new Error(`Failed to send animated media: ${error.message}`);
    }
  }

  async shareMediaToThread(threadId, mediaId, message = '') {
    try {
      const result = await this.ig.entity.directThread(threadId).broadcastMediaShare({
        media_id: mediaId,
        text: message
      });
      logger.info(`Media shared to thread ${threadId}`);
      
      if (result && result.item_id) {
        this.seenMessageIds.add(result.item_id);
      }
      
      return result;
    } catch (error) {
      logger.error('Failed to share media:', error.message);
      throw new Error(`Failed to share media: ${error.message}`);
    }
  }

  async forwardMessage(fromThreadId, toThreadId, itemId) {
    try {
      const mediaInfo = await this.getMessageMediaUrl(fromThreadId, itemId);
      
      if (mediaInfo.media) {
        if (mediaInfo.media.videos) {
          const videoUrl = mediaInfo.media.videos[0].url;
          return await this.sendVideoFromUrl(toThreadId, videoUrl);
        } else if (mediaInfo.media.images) {
          const imageUrl = mediaInfo.media.images[0].url;
          return await this.sendPhotoFromUrl(toThreadId, imageUrl);
        }
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
      
      if (this.replyHandlers.has(itemId)) {
        this.replyHandlers.delete(itemId);
        logger.debug(`Cleared reply handler for deleted message ${itemId}`);
      }
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

  registerReplyHandler(itemId, callback, timeout = 120000) {
    this.replyHandlers.set(itemId, {
      callback: callback,
      timestamp: Date.now()
    });
    
    setTimeout(() => {
      if (this.replyHandlers.has(itemId)) {
        this.replyHandlers.delete(itemId);
        logger.debug(`Reply handler for ${itemId} expired after ${timeout}ms`);
      }
    }, timeout);
    
    logger.debug(`Reply handler registered for message ${itemId}`);
  }

  clearReplyHandler(itemId) {
    if (this.replyHandlers.has(itemId)) {
      this.replyHandlers.delete(itemId);
      logger.debug(`Reply handler cleared for message ${itemId}`);
      return true;
    }
    return false;
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
              for (const item of thread.items) {
                if (!item || !item.item_id) continue;
                
                if (this.seenMessageIds.has(item.item_id)) {
                  continue;
                }
                
                this.seenMessageIds.add(item.item_id);
                
                if (this.seenMessageIds.size > 10000) {
                  const itemsToDelete = Array.from(this.seenMessageIds).slice(0, 5000);
                  itemsToDelete.forEach(id => this.seenMessageIds.delete(id));
                }
                
                const messageEvent = {
                  thread_id: thread.thread_id,
                  item_id: item.item_id,
                  user_id: item.user_id,
                  text: item.text || '',
                  timestamp: item.timestamp,
                  message: item,
                  is_from_me: item.user_id && item.user_id.toString() === this.client.userId
                };
                
                if (item.replied_to_message) {
                  messageEvent.messageReply = {
                    item_id: item.replied_to_message.item_id,
                    text: item.replied_to_message.text || '',
                    user_id: item.replied_to_message.user_id,
                    timestamp: item.replied_to_message.timestamp
                  };
                  
                  if (this.replyHandlers.has(item.replied_to_message.item_id)) {
                    const handler = this.replyHandlers.get(item.replied_to_message.item_id);
                    try {
                      await handler.callback(messageEvent);
                      this.replyHandlers.delete(item.replied_to_message.item_id);
                    } catch (handlerError) {
                      logger.error('Reply handler error:', handlerError.message);
                    }
                  }
                }
                
                this.client.emit('message', messageEvent);
                
                if (item.user_id && item.user_id.toString() !== this.client.userId) {
                  logger.debug(`New message from ${item.user_id}: ${item.text || '(media)'}`);
                }
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
      await this.ig.entity.directThread(threadId).unhide();
      logger.info(`Thread ${threadId} unarchived`);
    } catch (error) {
      logger.error('Failed to unarchive thread:', error.message);
      throw new Error(`Failed to unarchive thread: ${error.message}`);
    }
  }

  async removeUserFromThread(threadId, userId) {
    try {
      await this.ig.entity.directThread(threadId).removeUser(userId.toString());
      logger.info(`User ${userId} removed from thread ${threadId}`);
    } catch (error) {
      logger.error('Failed to remove user from thread:', error.message);
      throw new Error(`Failed to remove user from thread: ${error.message}`);
    }
  }

  async sendSticker(threadId, stickerId) {
    try {
      const result = await this.ig.entity.directThread(threadId).broadcastSticker({
        sticker_id: stickerId
      });
      logger.info(`Sticker sent to thread ${threadId}`);
      
      if (result && result.item_id) {
        this.seenMessageIds.add(result.item_id);
      }
      
      return result;
    } catch (error) {
      logger.error('Failed to send sticker:', error.message);
      throw new Error(`Failed to send sticker: ${error.message}`);
    }
  }
}
