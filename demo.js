import InstagramChatAPI from './src/index.js';

console.log('===========================================');
console.log('  neokex-ica — Instagram Chat API v2.1.0');
console.log('===========================================');
console.log('');

const client = new InstagramChatAPI({ showBanner: false });

const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client))
  .filter(m => m !== 'constructor')
  .sort();

console.log(`Total API methods: ${methods.length}`);
console.log('');

const groups = {
  'Authentication & Session': ['login', 'loadCookiesFromFile', 'saveCookiesToFile', 'setCookies', 'getCookies', 'getCurrentUserID', 'getCurrentUsername', 'getSessionState', 'loadSessionState'],
  'Direct Messaging': ['sendMessage', 'sendMessageToUser', 'sendMessageBulk', 'scheduleMessage', 'sendMessageWithReply', 'sendMessageToUserWithReply'],
  'Inbox & Threads': ['getInbox', 'getFullInbox', 'getUnreadThreads', 'getThread', 'getThreadMessages', 'getThreadParticipants', 'getThreadIdByUsername', 'createThread', 'markAsSeen', 'markAllThreadsSeen', 'searchMessages'],
  'Media Sending': ['sendPhoto', 'sendPhotoWithCaption', 'sendPhotoFromUrl', 'sendVideo', 'sendVideoFromUrl', 'sendVoiceNote', 'sendSticker', 'sendGif', 'sendAnimatedMedia', 'sendLink', 'shareMediaToThread'],
  'Message Actions': ['unsendMessage', 'editMessage', 'forwardMessage', 'sendReaction', 'removeReaction', 'indicateTyping', 'getMessageMediaUrl', 'downloadMessageMedia'],
  'Thread Management': ['approveThread', 'declineThread', 'muteThread', 'unmuteThread', 'deleteThread', 'archiveThread', 'unarchiveThread', 'leaveThread', 'addUsersToThread', 'removeUserFromThread', 'updateThreadTitle'],
  'User & Social': ['getUserInfo', 'getUserInfoByUsername', 'searchUsers', 'getFriendshipStatus', 'getFriendshipStatuses', 'followUser', 'unfollowUser', 'blockUser', 'unblockUser', 'getBlockedUsers', 'muteUser', 'getFollowers', 'getFollowing'],
  'Content & Feeds': ['getUserFeed', 'getTimelineFeed', 'getHashtagFeed', 'getExploreFeed', 'getLocationFeed', 'getActivityFeed', 'getNotifications', 'getStories', 'getReelsTrayCandidates', 'getRecentMessages'],
  'Post Interactions': ['likePost', 'unlikePost', 'commentPost', 'deleteComment', 'likeComment', 'unlikeComment', 'getComments', 'getMediaInfo', 'deletePost', 'getTaggedPosts', 'getSavedPosts', 'savePost', 'unsavePost'],
  'Publishing': ['uploadPhoto', 'uploadVideo', 'uploadCarousel', 'uploadStory', 'uploadVideoStory'],
  'Profile': ['editProfile', 'setProfilePicture', 'removeProfilePicture', 'changePassword'],
  'Search': ['searchHashtags', 'searchLocations'],
  'Events': ['onMessage', 'onPendingRequest', 'onError', 'onLogin', 'onRateLimit', 'onTyping', 'onPollingStart', 'onPollingStop'],
  'Polling': ['startListening', 'stopListening', 'registerReplyHandler', 'clearReplyHandler'],
};

for (const [group, groupMethods] of Object.entries(groups)) {
  const available = groupMethods.filter(m => typeof client[m] === 'function');
  console.log(`  [${group}] (${available.length} methods)`);
  available.forEach(m => console.log(`    ✓ ${m}()`));
  console.log('');
}

console.log('Library loaded successfully. Client instance ready.');
console.log('');
console.log('Key bug fixes in v2.1.0:');
console.log('  • Fixed: messages now tracked correctly after send (item_id parsing from payload)');
console.log('  • Fixed: polling seeds existing message IDs on start — no false "new message" events');
console.log('  • Fixed: poll uses per-thread last_permanent_item diff — far fewer redundant API calls');
console.log('  • Fixed: sendMessageToUser now uses correct entity.directThread([id]) format');
console.log('');
console.log('New methods in v2.1.0:');
console.log('  sendMessageBulk, scheduleMessage, createThread, getThreadIdByUsername,');
console.log('  getFullInbox, getUnreadThreads, getThreadMessages, getThreadParticipants,');
console.log('  markAllThreadsSeen, searchMessages, sendPhotoWithCaption, declineThread,');
console.log('  blockUser, unblockUser, getBlockedUsers, muteUser, getFriendshipStatus,');
console.log('  getFriendshipStatuses, getHashtagFeed, getExploreFeed, getLocationFeed,');
console.log('  getActivityFeed, getNotifications, getStories, getReelsTrayCandidates,');
console.log('  getComments, deleteComment, likeComment, unlikeComment, getTaggedPosts,');
console.log('  getSavedPosts, savePost, unsavePost, uploadCarousel, uploadVideoStory,');
console.log('  editProfile, setProfilePicture, removeProfilePicture, changePassword,');
console.log('  searchHashtags, searchLocations, onPollingStart, onPollingStop');
