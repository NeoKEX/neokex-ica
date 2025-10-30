import InstagramClient from './InstagramClient.js';
import DirectMessage from './DirectMessage.js';

class InstagramChatAPI extends InstagramClient {
  constructor() {
    super();
    this.dm = new DirectMessage(this);
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
}

export default InstagramChatAPI;
