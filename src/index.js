import InstagramClientV2 from './InstagramClientV2.js';
import DirectMessageV2 from './DirectMessageV2.js';
import banner from './Banner.js';

let bannerShown = false;

class InstagramChatAPI extends InstagramClientV2 {
  constructor(options = {}) {
    super();
    this.dm = new DirectMessageV2(this);
    
    if (!bannerShown && options.showBanner !== false) {
      banner.showSimple('2.0.0');
      bannerShown = true;
    }
  }

  async login(username, password) {
    const result = await super.login(username, password);
    return result;
  }

  async sendMessage(threadId, text, options = {}) {
    return await this.dm.sendMessage(threadId, text, options);
  }

  async sendMessageToUser(userId, text, options = {}) {
    return await this.dm.sendMessageToUser(userId, text, options);
  }

  async sendMessageWithReply(threadId, text, onReplyCallback, options = {}) {
    return await this.dm.sendMessageWithReply(threadId, text, onReplyCallback, options);
  }

  async sendMessageToUserWithReply(userId, text, onReplyCallback, options = {}) {
    return await this.dm.sendMessageToUserWithReply(userId, text, onReplyCallback, options);
  }

  registerReplyHandler(itemId, callback, timeout = 120000) {
    return this.dm.registerReplyHandler(itemId, callback, timeout);
  }

  clearReplyHandler(itemId) {
    return this.dm.clearReplyHandler(itemId);
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

  async sendVideoFromUrl(threadId, videoUrl) {
    return await this.dm.sendVideoFromUrl(threadId, videoUrl);
  }

  async sendPhotoFromUrl(threadId, photoUrl) {
    return await this.dm.sendPhotoFromUrl(threadId, photoUrl);
  }

  async sendVoiceNote(threadId, audioPath, options = {}) {
    return await this.dm.sendVoiceNote(threadId, audioPath, options);
  }

  async sendSticker(threadId, stickerId) {
    return await this.dm.sendSticker(threadId, stickerId);
  }

  async sendGif(threadId, gifUrl) {
    return await this.dm.sendGif(threadId, gifUrl);
  }

  async sendAnimatedMedia(threadId, mediaId) {
    return await this.dm.sendAnimatedMedia(threadId, mediaId);
  }

  async shareMediaToThread(threadId, mediaId, message = '') {
    return await this.dm.shareMediaToThread(threadId, mediaId, message);
  }

  async sendLink(threadId, linkUrl, linkText = '') {
    return await this.dm.sendLink(threadId, linkUrl, linkText);
  }

  async getMessageMediaUrl(threadId, itemId) {
    return await this.dm.getMessageMediaUrl(threadId, itemId);
  }

  async downloadMessageMedia(threadId, itemId, savePath = null) {
    return await this.dm.downloadMessageMedia(threadId, itemId, savePath);
  }

  async forwardMessage(fromThreadId, toThreadId, itemId) {
    return await this.dm.forwardMessage(fromThreadId, toThreadId, itemId);
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

  async editMessage(threadId, itemId, newText) {
    return await this.dm.editMessage(threadId, itemId, newText);
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

  async uploadPhoto(photoPath, caption = '') {
    return await super.uploadPhoto(photoPath, caption);
  }

  async uploadVideo(videoPath, caption = '', coverPath = null) {
    return await super.uploadVideo(videoPath, caption, coverPath);
  }

  async uploadStory(photoPath, options = {}) {
    return await super.uploadStory(photoPath, options);
  }

  async getUserFeed(userId, maxItems = 30) {
    return await super.getUserFeed(userId, maxItems);
  }

  async getTimelineFeed(maxItems = 30) {
    return await super.getTimelineFeed(maxItems);
  }

  async likePost(mediaId) {
    return await super.likePost(mediaId);
  }

  async unlikePost(mediaId) {
    return await super.unlikePost(mediaId);
  }

  async commentPost(mediaId, text) {
    return await super.commentPost(mediaId, text);
  }

  async followUser(userId) {
    return await super.followUser(userId);
  }

  async unfollowUser(userId) {
    return await super.unfollowUser(userId);
  }

  async getFollowers(userId, maxItems = 100) {
    return await super.getFollowers(userId, maxItems);
  }

  async getFollowing(userId, maxItems = 100) {
    return await super.getFollowing(userId, maxItems);
  }

  async getMediaInfo(mediaId) {
    return await super.getMediaInfo(mediaId);
  }

  async deletePost(mediaId) {
    return await super.deletePost(mediaId);
  }

  async searchUsers(query) {
    return await super.searchUsers(query);
  }

  getIgClient() {
    return super.getIgClient();
  }
}

export default InstagramChatAPI;
