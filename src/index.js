import InstagramClient from './InstagramClient.js';
import DirectMessage from './DirectMessage.js';
import InstagrapiClient from './InstagrapiClient.js';
import banner from './Banner.js';

let bannerShown = false;

class InstagramChatAPI extends InstagramClient {
  constructor(options = {}) {
    super();
    
    // Choose mode: 'native' or 'instagrapi'
    this.mode = options.mode || 'native';
    
    if (this.mode === 'instagrapi') {
      this.instagrapiClient = new InstagrapiClient(options.instagrapiUrl);
    } else {
      this.dm = new DirectMessage(this);
    }
    
    if (!bannerShown && options.showBanner !== false) {
      banner.showSimple('1.1.2');
      bannerShown = true;
    }
  }

  async login(username, password) {
    if (this.mode === 'instagrapi') {
      return await this.instagrapiClient.login(username, password);
    }
    const result = await super.login(username, password);
    return result;
  }

  async sendMessage(threadId, text) {
    if (this.mode === 'instagrapi') {
      if (typeof threadId === 'string' && threadId.includes('_')) {
        return await this.instagrapiClient.sendTextMessage(null, text, threadId);
      } else {
        return await this.instagrapiClient.sendTextMessage(threadId, text);
      }
    }
    return await this.dm.sendMessage(threadId, text);
  }

  async sendMessageToUser(userId, text) {
    if (this.mode === 'instagrapi') {
      return await this.instagrapiClient.sendTextMessage(userId, text);
    }
    return await this.dm.sendMessageToUser(userId, text);
  }

  async getInbox() {
    if (this.mode === 'instagrapi') {
      return await this.instagrapiClient.getInbox();
    }
    return await this.dm.getInbox();
  }

  async getThread(threadId) {
    if (this.mode === 'instagrapi') {
      return await this.instagrapiClient.getThread(threadId);
    }
    return await this.dm.getThread(threadId);
  }

  async startListening(interval = 5000) {
    if (this.mode === 'instagrapi') {
      throw new Error('Real-time listening not supported in instagrapi mode. Use polling manually.');
    }
    await this.dm.startPolling(interval);
  }

  stopListening() {
    if (this.mode === 'instagrapi') {
      return;
    }
    this.dm.stopPolling();
  }

  async getRecentMessages(limit = 20) {
    if (this.mode === 'instagrapi') {
      const inbox = await this.instagrapiClient.getInbox();
      return inbox.threads || [];
    }
    return await this.dm.getRecentMessages(limit);
  }

  async markAsSeen(threadId, itemId) {
    if (this.mode === 'instagrapi') {
      return await this.instagrapiClient.markSeen(threadId, itemId);
    }
    return await this.dm.markAsSeen(threadId, itemId);
  }

  async approveThread(threadId) {
    if (this.mode === 'instagrapi') {
      throw new Error('approveThread not yet implemented in instagrapi mode');
    }
    return await this.dm.approveThread(threadId);
  }

  async sendPhoto(threadIdOrUserId, photoPath, caption = '') {
    if (this.mode === 'instagrapi') {
      // Detect if it's a thread ID (string with underscore like "340282366841710300949128_123456")
      // or a user ID (numeric string or array)
      const isThreadId = typeof threadIdOrUserId === 'string' && threadIdOrUserId.includes('_');
      if (isThreadId) {
        return await this.instagrapiClient.sendPhoto(null, photoPath, caption, threadIdOrUserId);
      } else {
        return await this.instagrapiClient.sendPhoto(threadIdOrUserId, photoPath, caption);
      }
    }
    return await this.dm.sendPhoto(threadIdOrUserId, photoPath);
  }

  async sendVideo(threadIdOrUserId, videoPath, caption = '') {
    if (this.mode === 'instagrapi') {
      const isThreadId = typeof threadIdOrUserId === 'string' && threadIdOrUserId.includes('_');
      if (isThreadId) {
        return await this.instagrapiClient.sendVideo(null, videoPath, caption, threadIdOrUserId);
      } else {
        return await this.instagrapiClient.sendVideo(threadIdOrUserId, videoPath, caption);
      }
    }
    return await this.dm.sendVideo(threadIdOrUserId, videoPath);
  }

  async sendVoiceNote(threadIdOrUserId, audioPath) {
    if (this.mode === 'instagrapi') {
      const isThreadId = typeof threadIdOrUserId === 'string' && threadIdOrUserId.includes('_');
      if (isThreadId) {
        return await this.instagrapiClient.sendVoice(null, audioPath, threadIdOrUserId);
      } else {
        return await this.instagrapiClient.sendVoice(threadIdOrUserId, audioPath);
      }
    }
    return await this.dm.sendVoiceNote(threadIdOrUserId, audioPath);
  }

  async sendSticker(threadId, stickerId) {
    if (this.mode === 'instagrapi') {
      throw new Error('sendSticker not yet implemented in instagrapi mode');
    }
    return await this.dm.sendSticker(threadId, stickerId);
  }

  async sendLink(threadId, linkUrl, linkText = '') {
    if (this.mode === 'instagrapi') {
      throw new Error('sendLink not yet implemented in instagrapi mode');
    }
    return await this.dm.sendLink(threadId, linkUrl, linkText);
  }

  async sendReaction(threadId, itemId, emoji) {
    if (this.mode === 'instagrapi') {
      throw new Error('sendReaction not yet implemented in instagrapi mode');
    }
    return await this.dm.sendReaction(threadId, itemId, emoji);
  }

  async removeReaction(threadId, itemId) {
    if (this.mode === 'instagrapi') {
      throw new Error('removeReaction not yet implemented in instagrapi mode');
    }
    return await this.dm.removeReaction(threadId, itemId);
  }

  async unsendMessage(threadId, itemId) {
    if (this.mode === 'instagrapi') {
      throw new Error('unsendMessage not yet implemented in instagrapi mode');
    }
    return await this.dm.unsendMessage(threadId, itemId);
  }

  async indicateTyping(threadId, isTyping = true) {
    if (this.mode === 'instagrapi') {
      throw new Error('indicateTyping not yet implemented in instagrapi mode');
    }
    return await this.dm.indicateTyping(threadId, isTyping);
  }

  async muteThread(threadId) {
    if (this.mode === 'instagrapi') {
      throw new Error('muteThread not yet implemented in instagrapi mode');
    }
    return await this.dm.muteThread(threadId);
  }

  async unmuteThread(threadId) {
    if (this.mode === 'instagrapi') {
      throw new Error('unmuteThread not yet implemented in instagrapi mode');
    }
    return await this.dm.unmuteThread(threadId);
  }

  async deleteThread(threadId) {
    if (this.mode === 'instagrapi') {
      throw new Error('deleteThread not yet implemented in instagrapi mode');
    }
    return await this.dm.deleteThread(threadId);
  }

  async archiveThread(threadId) {
    if (this.mode === 'instagrapi') {
      throw new Error('archiveThread not yet implemented in instagrapi mode');
    }
    return await this.dm.archiveThread(threadId);
  }

  async unarchiveThread(threadId) {
    if (this.mode === 'instagrapi') {
      throw new Error('unarchiveThread not yet implemented in instagrapi mode');
    }
    return await this.dm.unarchiveThread(threadId);
  }

  async leaveThread(threadId) {
    if (this.mode === 'instagrapi') {
      throw new Error('leaveThread not yet implemented in instagrapi mode');
    }
    return await this.dm.leaveThread(threadId);
  }

  async addUsersToThread(threadId, userIds) {
    if (this.mode === 'instagrapi') {
      throw new Error('addUsersToThread not yet implemented in instagrapi mode');
    }
    return await this.dm.addUsersToThread(threadId, userIds);
  }

  async removeUserFromThread(threadId, userId) {
    if (this.mode === 'instagrapi') {
      throw new Error('removeUserFromThread not yet implemented in instagrapi mode');
    }
    return await this.dm.removeUserFromThread(threadId, userId);
  }

  async updateThreadTitle(threadId, title) {
    if (this.mode === 'instagrapi') {
      throw new Error('updateThreadTitle not yet implemented in instagrapi mode');
    }
    return await this.dm.updateThreadTitle(threadId, title);
  }

  onMessage(callback) {
    this.on('message', callback);
  }

  onPendingRequest(callback) {
    this.on('pending_request', callback);
  }

  onError(callback) {
    this.on('error', callback);
  }

  onLogin(callback) {
    this.on('login', callback);
  }

  onRateLimit(callback) {
    this.on('ratelimit', callback);
  }

  onTyping(callback) {
    this.on('typing', callback);
  }

  loadCookiesFromFile(filePath) {
    return super.loadCookiesFromFile(filePath);
  }

  saveCookiesToFile(filePath, domain = '.instagram.com') {
    return super.saveCookiesToFile(filePath, domain);
  }

  setCookies(cookies) {
    return super.setCookies(cookies);
  }

  getCookies() {
    return super.getCookies();
  }

  getCurrentUserID() {
    return super.getCurrentUserID();
  }

  getCurrentUsername() {
    return super.getCurrentUsername();
  }

  async getUserInfo(userId) {
    if (this.mode === 'instagrapi') {
      return await this.instagrapiClient.getUserById(userId);
    }
    return await super.getUserInfo(userId);
  }

  async getUserInfoByUsername(username) {
    if (this.mode === 'instagrapi') {
      return await this.instagrapiClient.getUserByUsername(username);
    }
    return await super.getUserInfoByUsername(username);
  }

  async getSessionState() {
    return await super.getSessionState();
  }

  loadSessionState(sessionState) {
    return super.loadSessionState(sessionState);
  }
}

export default InstagramChatAPI;
