import InstagramChatAPI from './src/index.js';

console.log('===========================================');
console.log('  neokex-ica — Instagram Chat API v2.2.0');
console.log('===========================================');
console.log('');

const client = new InstagramChatAPI({ showBanner: false });

const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client))
  .filter(m => m !== 'constructor')
  .sort();

console.log(`Total API methods: ${methods.length}`);
console.log('');

const groups = {
  'Auth & Session':       ['login', 'loadCookiesFromFile', 'saveCookiesToFile', 'setCookies', 'getCookies', 'getCurrentUserID', 'getCurrentUsername', 'getSessionState', 'loadSessionState', 'validateSession', 'pingSession'],
  'Direct Messaging':     ['sendMessage', 'sendMessageToUser', 'sendMessageBulk', 'scheduleMessage', 'sendMessageWithReply', 'sendMessageToUserWithReply'],
  'Inbox & Threads':      ['getInbox', 'getFullInbox', 'getUnreadThreads', 'getThread', 'getThreadMessages', 'getThreadParticipants', 'getThreadIdByUsername', 'createThread', 'markAsSeen', 'markAllThreadsSeen', 'searchMessages'],
  'Media Sending':        ['sendPhoto', 'sendPhotoWithCaption', 'sendPhotoFromUrl', 'sendVideo', 'sendVideoFromUrl', 'sendVoiceNote', 'sendSticker', 'sendGif', 'sendAnimatedMedia', 'sendLink', 'shareMediaToThread'],
  'Message Actions':      ['unsendMessage', 'editMessage', 'forwardMessage', 'sendReaction', 'removeReaction', 'indicateTyping', 'getMessageMediaUrl', 'downloadMessageMedia'],
  'Thread Management':    ['approveThread', 'declineThread', 'muteThread', 'unmuteThread', 'deleteThread', 'archiveThread', 'unarchiveThread', 'leaveThread', 'addUsersToThread', 'removeUserFromThread', 'updateThreadTitle'],
  'User & Social':        ['getUserInfo', 'getUserInfoByUsername', 'searchUsers', 'getFriendshipStatus', 'getFriendshipStatuses', 'followUser', 'unfollowUser', 'blockUser', 'unblockUser', 'getBlockedUsers', 'muteUser', 'getFollowers', 'getFollowing'],
  'Content & Feeds':      ['getUserFeed', 'getTimelineFeed', 'getHashtagFeed', 'getExploreFeed', 'getLocationFeed', 'getActivityFeed', 'getNotifications', 'getStories', 'getReelsTrayCandidates', 'getRecentMessages'],
  'Post Interactions':    ['likePost', 'unlikePost', 'commentPost', 'deleteComment', 'likeComment', 'unlikeComment', 'getComments', 'getMediaInfo', 'deletePost', 'getTaggedPosts', 'getSavedPosts', 'savePost', 'unsavePost'],
  'Publishing':           ['uploadPhoto', 'uploadVideo', 'uploadCarousel', 'uploadStory', 'uploadVideoStory'],
  'Profile':              ['editProfile', 'setProfilePicture', 'removeProfilePicture', 'changePassword'],
  'Search':               ['searchHashtags', 'searchLocations'],
  'Health & Control':     ['getStatus', 'validateSession', 'pingSession', 'restartPolling'],
  'Polling':              ['startListening', 'stopListening', 'registerReplyHandler', 'clearReplyHandler'],
  'Events':               ['onMessage', 'onPendingRequest', 'onError', 'onLogin', 'onRateLimit', 'onTyping', 'onPollingStart', 'onPollingStop', 'onSessionExpired', 'onCircuitOpen', 'onCircuitClosed', 'onShutdown'],
};

for (const [group, groupMethods] of Object.entries(groups)) {
  const available = [...new Set(groupMethods)].filter(m => typeof client[m] === 'function');
  console.log(`  [${group}] (${available.length})`);
  available.forEach(m => console.log(`    + ${m}()`));
  console.log('');
}

const status = client.getStatus();
console.log('Health check:', JSON.stringify(status, null, 2));

console.log('');
console.log('v2.2.0 Long-Running Bot Improvements:');
console.log('  • Circuit breaker: opens after N consecutive errors, auto-recovers');
console.log('  • Adaptive polling: speeds up on activity, slows down when quiet');
console.log('  • Per-request timeout: hung HTTP calls never stall the loop');
console.log('  • Shared retry logic (withRetry) on all send operations');
console.log('  • SIGTERM/SIGINT graceful shutdown with cleanup');
console.log('  • Session expiry detection: emits session:expired and stops safely');
console.log('  • LRU-based seenMessageIds eviction (cap 5k, evict oldest 2.5k)');
console.log('  • Reply handler sweep: periodic cleanup of leaked handlers');
console.log('  • scheduleMessage() returns cancelable promise with .cancel()');
console.log('  • getStatus() / getPollingStats() for observability');
console.log('  • validateSession() / pingSession() for health checks');
console.log('  • restartPolling() to recover without full restart');
console.log('  • Fixed getFollowers/getFollowing pagination (do-while)');
console.log('  • Error classification: auth / ratelimit / network / unknown');
console.log('  • uncaughtException & unhandledRejection forwarded to onError');
