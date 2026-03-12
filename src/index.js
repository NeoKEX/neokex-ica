import InstagramClientV2 from './InstagramClientV2.js';
import DirectMessageV2 from './DirectMessageV2.js';
import banner from './Banner.js';

let bannerShown = false;

class InstagramChatAPI extends InstagramClientV2 {
  constructor(options = {}) {
    super();
    this.dm = new DirectMessageV2(this);

    if (!bannerShown && options.showBanner !== false) {
      banner.showSimple('1.0.0');
      bannerShown = true;
    }
  }

  getStatus() {
    const stats = this.dm.getPollingStats();
    return {
      isLoggedIn:    this.isLoggedIn,
      userId:        this.userId,
      username:      this.username,
      isPolling:     this.isPolling,
      pollingStats:  stats,
    };
  }

  async login(username, password) {
    return await super.login(username, password);
  }

  // ─── Direct Messaging ────────────────────────────────────────────────────────

  async sendMessage(threadId, text, options = {}) {
    return await this.dm.sendMessage(threadId, text, options);
  }

  async sendMessageToUser(userId, text, options = {}) {
    return await this.dm.sendMessageToUser(userId, text, options);
  }

  async sendMessageBulk(threadIds, text, delayBetween = 1000) {
    return await this.dm.sendMessageBulk(threadIds, text, delayBetween);
  }

  async scheduleMessage(threadId, text, delayMs, options = {}) {
    return await this.dm.scheduleMessage(threadId, text, delayMs, options);
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

  // ─── Inbox & Threads ─────────────────────────────────────────────────────────

  async getInbox(options = {}) {
    return await this.dm.getInbox(options);
  }

  async getFullInbox(maxPages = 5) {
    return await this.dm.getFullInbox(maxPages);
  }

  async getUnreadThreads() {
    return await this.dm.getUnreadThreads();
  }

  async getThread(threadId, options = {}) {
    return await this.dm.getThread(threadId, options);
  }

  async getThreadMessages(threadId, limit = 20) {
    return await this.dm.getThreadMessages(threadId, limit);
  }

  async getThreadParticipants(threadId) {
    return await this.dm.getThreadParticipants(threadId);
  }

  async getThreadIdByUsername(username) {
    return await this.dm.getThreadIdByUsername(username);
  }

  async createThread(userIds) {
    return await this.dm.createThread(userIds);
  }

  async startListening(intervalOrOptions = 5000) {
    await this.dm.startPolling(intervalOrOptions);
  }

  stopListening() {
    this.dm.stopPolling();
  }

  async restartPolling(intervalOrOptions) {
    return this.dm.restartPolling(intervalOrOptions);
  }

  async getRecentMessages(limit = 20) {
    return await this.dm.getRecentMessages(limit);
  }

  async markAsSeen(threadId, itemId) {
    return await this.dm.markAsSeen(threadId, itemId);
  }

  async markAllThreadsSeen() {
    return await this.dm.markAllThreadsSeen();
  }

  async searchMessages(threadId, query) {
    return await this.dm.searchMessages(threadId, query);
  }

  async approveThread(threadId) {
    return await this.dm.approveThread(threadId);
  }

  async declineThread(threadId) {
    return await this.dm.declineThread(threadId);
  }

  // ─── Media Sending ───────────────────────────────────────────────────────────

  async sendPhoto(threadId, photoPath) {
    return await this.dm.sendPhoto(threadId, photoPath);
  }

  async sendPhotoWithCaption(threadId, photoPath, caption = '') {
    return await this.dm.sendPhotoWithCaption(threadId, photoPath, caption);
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

  async sendGif(threadId, giphyId) {
    return await this.dm.sendGif(threadId, giphyId);
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

  // ─── Message Operations ──────────────────────────────────────────────────────

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

  // ─── Thread Management ───────────────────────────────────────────────────────

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

  // ─── Event Handlers ──────────────────────────────────────────────────────────

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

  onPollingStart(callback) {
    this.on('polling:start', callback);
  }

  onPollingStop(callback) {
    this.on('polling:stop', callback);
  }

  onSessionExpired(callback) {
    this.on('session:expired', callback);
  }

  onCircuitOpen(callback) {
    this.on('circuit:open', callback);
  }

  onCircuitClosed(callback) {
    this.on('circuit:closed', callback);
  }

  onShutdown(callback) {
    this.on('shutdown', callback);
  }

  // ─── Session & Auth ──────────────────────────────────────────────────────────

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

  async getSessionState() {
    return await super.getSessionState();
  }

  async loadSessionState(sessionState) {
    return super.loadSessionState(sessionState);
  }

  async validateSession() {
    return super.validateSession();
  }

  async pingSession() {
    return super.pingSession();
  }

  // ─── User Info & Social ──────────────────────────────────────────────────────

  async getUserInfo(userId) {
    return await super.getUserInfo(userId);
  }

  async getUserInfoByUsername(username) {
    return await super.getUserInfoByUsername(username);
  }

  async searchUsers(query) {
    return await super.searchUsers(query);
  }

  async getFriendshipStatus(userId) {
    return await super.getFriendshipStatus(userId);
  }

  async getFriendshipStatuses(userIds) {
    return await super.getFriendshipStatuses(userIds);
  }

  async followUser(userId) {
    return await super.followUser(userId);
  }

  async unfollowUser(userId) {
    return await super.unfollowUser(userId);
  }

  async blockUser(userId) {
    return await super.blockUser(userId);
  }

  async unblockUser(userId) {
    return await super.unblockUser(userId);
  }

  async getBlockedUsers() {
    return await super.getBlockedUsers();
  }

  async muteUser(userId, muteStories = false, mutePosts = false) {
    return await super.muteUser(userId, muteStories, mutePosts);
  }

  async getFollowers(userId, maxItems = 100) {
    return await super.getFollowers(userId, maxItems);
  }

  async getFollowing(userId, maxItems = 100) {
    return await super.getFollowing(userId, maxItems);
  }

  // ─── Content & Feeds ─────────────────────────────────────────────────────────

  async getUserFeed(userId, maxItems = 30) {
    return await super.getUserFeed(userId, maxItems);
  }

  async getTimelineFeed(maxItems = 30) {
    return await super.getTimelineFeed(maxItems);
  }

  async getHashtagFeed(hashtag, maxItems = 30) {
    return await super.getHashtagFeed(hashtag, maxItems);
  }

  async getExploreFeed(maxItems = 30) {
    return await super.getExploreFeed(maxItems);
  }

  async getLocationFeed(locationId, maxItems = 30) {
    return await super.getLocationFeed(locationId, maxItems);
  }

  async getActivityFeed() {
    return await super.getActivityFeed();
  }

  async getNotifications() {
    return await super.getNotifications();
  }

  async getStories(userId) {
    return await super.getStories(userId);
  }

  async getReelsTrayCandidates() {
    return await super.getReelsTrayCandidates();
  }

  // ─── Post Interactions ───────────────────────────────────────────────────────

  async likePost(mediaId) {
    return await super.likePost(mediaId);
  }

  async unlikePost(mediaId) {
    return await super.unlikePost(mediaId);
  }

  async commentPost(mediaId, text) {
    return await super.commentPost(mediaId, text);
  }

  async deleteComment(mediaId, commentId) {
    return await super.deleteComment(mediaId, commentId);
  }

  async likeComment(mediaId, commentId) {
    return await super.likeComment(mediaId, commentId);
  }

  async unlikeComment(mediaId, commentId) {
    return await super.unlikeComment(mediaId, commentId);
  }

  async getComments(mediaId, maxItems = 20) {
    return await super.getComments(mediaId, maxItems);
  }

  async getMediaInfo(mediaId) {
    return await super.getMediaInfo(mediaId);
  }

  async deletePost(mediaId) {
    return await super.deletePost(mediaId);
  }

  async getTaggedPosts(userId, maxItems = 30) {
    return await super.getTaggedPosts(userId, maxItems);
  }

  async getSavedPosts(maxItems = 30) {
    return await super.getSavedPosts(maxItems);
  }

  async savePost(mediaId) {
    return await super.savePost(mediaId);
  }

  async unsavePost(mediaId) {
    return await super.unsavePost(mediaId);
  }

  // ─── Publishing ───────────────────────────────────────────────────────────────

  async uploadPhoto(photoPath, caption = '') {
    return await super.uploadPhoto(photoPath, caption);
  }

  async uploadVideo(videoPath, caption = '', coverPath = null) {
    return await super.uploadVideo(videoPath, caption, coverPath);
  }

  async uploadCarousel(photoPaths, caption = '') {
    return await super.uploadCarousel(photoPaths, caption);
  }

  async uploadStory(photoPath, options = {}) {
    return await super.uploadStory(photoPath, options);
  }

  async uploadVideoStory(videoPath, options = {}) {
    return await super.uploadVideoStory(videoPath, options);
  }

  // ─── Profile Management ──────────────────────────────────────────────────────

  async editProfile(options = {}) {
    return await super.editProfile(options);
  }

  async setProfilePicture(photoPath) {
    return await super.setProfilePicture(photoPath);
  }

  async removeProfilePicture() {
    return await super.removeProfilePicture();
  }

  async changePassword(oldPassword, newPassword) {
    return await super.changePassword(oldPassword, newPassword);
  }

  // ─── Search ──────────────────────────────────────────────────────────────────

  async searchHashtags(query) {
    return await super.searchHashtags(query);
  }

  async searchLocations(query) {
    return await super.searchLocations(query);
  }

  getIgClient() {
    return super.getIgClient();
  }
}

export default InstagramChatAPI;
