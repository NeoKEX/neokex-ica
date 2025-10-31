import InstagramClient from './InstagramClient.js';
import DirectMessage from './DirectMessage.js';
import banner from './Banner.js';

let bannerShown = false;

class InstagramChatAPI extends InstagramClient {
  constructor(options = {}) {
    super();
    this.dm = new DirectMessage(this);
    
    if (!bannerShown && options.showBanner !== false) {
      banner.showSimple('2.0.0');
      bannerShown = true;
    }
  }

  async login(username, password) {
    const result = await super.login(username, password);
    return result;
  }

  async sendMessage(threadId, text) {
    return await this.dm.sendMessage(threadId, text);
  }

  async sendMessageToUser(userId, text) {
    return await this.dm.sendMessageToUser(userId, text);
  }

  async getInbox() {
    return await this.dm.getInbox();
  }

  async getThread(threadId) {
    return await this.dm.getThread(threadId);
  }

  async startListening(interval = 5000) {
    await this.dm.startPolling(interval);
  }

  stopListening() {
    this.dm.stopPolling();
  }

  async getRecentMessages(limit = 20) {
    return await this.dm.getRecentMessages(limit);
  }

  async markAsSeen(threadId, itemId) {
    return await this.dm.markAsSeen(threadId, itemId);
  }

  async approveThread(threadId) {
    return await this.dm.approveThread(threadId);
  }

  async sendPhoto(threadId, photoPath) {
    return await this.dm.sendPhoto(threadId, photoPath);
  }

  async sendVideo(threadId, videoPath, options = {}) {
    return await this.dm.sendVideo(threadId, videoPath, options);
  }

  async sendVoiceNote(threadId, audioPath, options = {}) {
    return await this.dm.sendVoiceNote(threadId, audioPath, options);
  }

  async sendSticker(threadId, stickerId) {
    return await this.dm.sendSticker(threadId, stickerId);
  }

  async sendLink(threadId, linkUrl, linkText = '') {
    return await this.dm.sendLink(threadId, linkUrl, linkText);
  }

  async sendReaction(threadId, itemId, emoji) {
    return await this.dm.sendReaction(threadId, itemId, emoji);
  }

  async removeReaction(threadId, itemId) {
    return await this.dm.removeReaction(threadId, itemId);
  }

  async unsendMessage(threadId, itemId) {
    return await this.dm.unsendMessage(threadId, itemId);
  }

  async indicateTyping(threadId, isTyping = true) {
    return await this.dm.indicateTyping(threadId, isTyping);
  }

  async muteThread(threadId) {
    return await this.dm.muteThread(threadId);
  }

  async unmuteThread(threadId) {
    return await this.dm.unmuteThread(threadId);
  }

  async deleteThread(threadId) {
    return await this.dm.deleteThread(threadId);
  }

  async archiveThread(threadId) {
    return await this.dm.archiveThread(threadId);
  }

  async unarchiveThread(threadId) {
    return await this.dm.unarchiveThread(threadId);
  }

  async leaveThread(threadId) {
    return await this.dm.leaveThread(threadId);
  }

  async addUsersToThread(threadId, userIds) {
    return await this.dm.addUsersToThread(threadId, userIds);
  }

  async removeUserFromThread(threadId, userId) {
    return await this.dm.removeUserFromThread(threadId, userId);
  }

  async updateThreadTitle(threadId, title) {
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
    return await super.getUserInfo(userId);
  }

  async getUserInfoByUsername(username) {
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
