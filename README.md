# neokex-ica

> **Professional Instagram Chat API for Node.js**

A powerful, production-ready Instagram automation library with 60+ methods for building Instagram bots, chatbots, and automation tools. Send messages, photos, manage threads, automate interactions, and more.

[![npm version](https://img.shields.io/npm/v/neokex-ica.svg)](https://www.npmjs.com/package/neokex-ica)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)](https://nodejs.org)

## ⚠️ Disclaimer

This is an **unofficial** library that uses Instagram's private/internal APIs. Using this may violate Instagram's Terms of Service and could result in account restrictions or bans. **Use at your own risk, for educational purposes only.**

---

## ✨ Features

### 📱 Complete Messaging Suite
- ✅ **Text Messages** - Send to threads or users
- ✅ **Photo Uploads** - Send images from files or URLs with auto-processing
- ✅ **Link Sharing** - Share URLs with previews
- ✅ **Reactions** - React to messages with emojis
- ✅ **Unsend Messages** - Delete sent messages
- ✅ **Mark as Seen** - Read receipts

### 🎯 Thread Management
- Get inbox and filter conversations
- Mute/unmute threads
- Archive/unarchive conversations
- Delete threads
- Approve pending message requests
- Typing indicators

### 👥 User Operations
- Get user information by ID or username
- Search users
- Get followers & following lists
- Get timeline feed
- Get user feed

### 🎨 Social Features
- Like/unlike posts
- Comment on posts
- Follow/unfollow users
- Upload photos to feed
- Upload stories
- Get media information

### 🔐 Authentication
- Cookie-based authentication (recommended)
- Username/password login
- Session management
- Automatic re-authentication

---

## 📦 Installation

```bash
npm install neokex-ica
```

---

## 🚀 Quick Start

### Option 1: Cookie Authentication (Recommended)

```javascript
import InstagramChatAPI from 'neokex-ica';

const bot = new InstagramChatAPI();

// Load cookies from file (Netscape format)
// Export using browser extension: "Get cookies.txt" (Chrome/Firefox)
await bot.loadCookiesFromFile('./cookies.txt');

// Send a text message
await bot.dm.sendMessage('thread_id', 'Hello from neokex-ica!');

// Get inbox
const inbox = await bot.getInbox();
console.log(`You have ${inbox.threads.length} conversations`);
```

### Option 2: Username/Password Login

```javascript
import InstagramChatAPI from 'neokex-ica';

const bot = new InstagramChatAPI();

// Login
await bot.login('your_username', 'your_password');

// Save session for later reuse
await bot.saveCookiesToFile('./cookies.txt');

// Use the bot
await bot.dm.sendMessageToUser('user_id', 'Hi there!');
```

---

## 📚 API Reference

### Authentication Methods

```javascript
// Login with username and password
await bot.login(username, password);

// Load cookies from file
await bot.loadCookiesFromFile('./cookies.txt');

// Save cookies to file
await bot.saveCookiesToFile('./cookies.txt');

// Get current user info
const userId = bot.getCurrentUserID();
const username = bot.getCurrentUsername();
```

### Messaging Methods

```javascript
// Send text message to thread
await bot.dm.sendMessage(threadId, 'Hello!');

// Send text message to user (creates thread if needed)
await bot.dm.sendMessageToUser(userId, 'Hello!');

// Send photo from file
await bot.dm.sendPhoto(threadId, './image.jpg');

// Send photo from URL
await bot.dm.sendPhotoFromUrl(threadId, 'https://example.com/image.jpg');

// Send link
await bot.dm.sendLink(threadId, 'https://example.com', 'Check this out!');

// React to message
await bot.dm.sendReaction(threadId, itemId, '❤️');

// Remove reaction
await bot.dm.removeReaction(threadId, itemId);

// Unsend message
await bot.dm.unsendMessage(threadId, itemId);

// Mark message as seen
await bot.dm.markAsSeen(threadId, itemId);

// Show typing indicator
await bot.dm.indicateTyping(threadId, true);
```

### Inbox & Thread Management

```javascript
// Get inbox
const inbox = await bot.getInbox();

// Get specific thread
const thread = await bot.dm.getThread(threadId);

// Get pending message requests
const pending = await bot.dm.getPendingInbox();

// Approve pending thread
await bot.dm.approveThread(threadId);

// Mute thread
await bot.dm.muteThread(threadId);

// Unmute thread
await bot.dm.unmuteThread(threadId);

// Delete thread
await bot.dm.deleteThread(threadId);
```

### User Methods

```javascript
// Get user info by ID
const user = await bot.getUserInfo(userId);

// Get user info by username
const user = await bot.getUserInfoByUsername('username');

// Search users
const results = await bot.searchUsers('query');

// Get followers (with limit)
const followers = await bot.getFollowers(userId, 50);

// Get following (with limit)
const following = await bot.getFollowing(userId, 50);
```

### Feed & Posts

```javascript
// Get timeline feed
const timeline = await bot.getTimelineFeed(20);

// Get user feed
const userFeed = await bot.getUserFeed(userId, 20);

// Like post
await bot.likePost(mediaId);

// Unlike post
await bot.unlikePost(mediaId);

// Comment on post
await bot.commentPost(mediaId, 'Great post!');

// Get media info
const mediaInfo = await bot.getMediaInfo(mediaId);

// Delete post
await bot.deletePost(mediaId);
```

### Upload Content

```javascript
// Upload photo to feed
const result = await bot.uploadPhoto('./photo.jpg', 'My caption #hashtag');

// Upload story
await bot.uploadStory('./story.jpg');
```

### Social Actions

```javascript
// Follow user
await bot.followUser(userId);

// Unfollow user
await bot.unfollowUser(userId);
```

---

## 🎨 Advanced Examples

### Auto-Reply Bot

```javascript
import InstagramChatAPI from 'neokex-ica';

const bot = new InstagramChatAPI();
await bot.loadCookiesFromFile('./cookies.txt');

// Listen for new messages
bot.on('message', async (message) => {
  const { threadId, text, userId } = message;
  
  // Don't reply to yourself
  if (userId === bot.getCurrentUserID()) return;
  
  // Auto-reply
  await bot.dm.sendMessage(threadId, `Thanks for your message: "${text}"`);
});

// Start polling for messages every 5 seconds
bot.dm.startPolling(5000);
```

### Send Photo from URL

```javascript
const photoUrl = 'https://picsum.photos/800/600';
await bot.dm.sendPhotoFromUrl(threadId, photoUrl);
```

### Bulk DM Sender

```javascript
const users = ['user1_id', 'user2_id', 'user3_id'];
const message = 'Hey! Check out our new product!';

for (const userId of users) {
  try {
    await bot.dm.sendMessageToUser(userId, message);
    console.log(`✅ Sent to ${userId}`);
    
    // Delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 3000));
  } catch (error) {
    console.error(`❌ Failed to send to ${userId}:`, error.message);
  }
}
```

### Get and Display Inbox

```javascript
const inbox = await bot.getInbox();

inbox.threads.forEach((thread, index) => {
  const username = thread.users?.[0]?.username || 'Unknown';
  const lastMessage = thread.last_permanent_item?.text || '(media)';
  console.log(`${index + 1}. @${username}: ${lastMessage}`);
});
```

---

## 🔧 Configuration

### Constructor Options

```javascript
const bot = new InstagramChatAPI({
  showBanner: false  // Hide the startup banner (default: true)
});
```

---

## ⚡ Performance Tips

1. **Use Cookie Authentication** - Much faster and more reliable than username/password
2. **Reuse Sessions** - Save cookies and reuse them to avoid logging in repeatedly
3. **Rate Limiting** - Add delays between requests to avoid Instagram's rate limits
4. **Error Handling** - Always wrap API calls in try-catch blocks

---

## 🛡️ Security Best Practices

1. **Never commit credentials** - Use environment variables or config files (added to .gitignore)
2. **Rotate accounts** - Don't use your main Instagram account
3. **Respect rate limits** - Instagram will ban accounts that spam
4. **Use proxies** - For production bots, consider using proxies
5. **Handle 2FA** - Be prepared for two-factor authentication challenges

---

## 📋 Available Methods (60+)

<details>
<summary>Click to expand full method list</summary>

### Authentication
- `login(username, password)`
- `loadCookiesFromFile(path)`
- `saveCookiesToFile(path)`
- `getCurrentUserID()`
- `getCurrentUsername()`

### Direct Messages
- `dm.sendMessage(threadId, text)`
- `dm.sendMessageToUser(userId, text)`
- `dm.sendPhoto(threadId, photoPath)`
- `dm.sendPhotoFromUrl(threadId, photoUrl)`
- `dm.sendLink(threadId, url, text)`
- `dm.sendReaction(threadId, itemId, emoji)`
- `dm.removeReaction(threadId, itemId)`
- `dm.unsendMessage(threadId, itemId)`
- `dm.markAsSeen(threadId, itemId)`
- `dm.indicateTyping(threadId, isTyping)`

### Inbox & Threads
- `getInbox()`
- `dm.getThread(threadId)`
- `dm.getPendingInbox()`
- `dm.approveThread(threadId)`
- `dm.muteThread(threadId)`
- `dm.unmuteThread(threadId)`
- `dm.deleteThread(threadId)`

### Users
- `getUserInfo(userId)`
- `getUserInfoByUsername(username)`
- `searchUsers(query)`
- `getFollowers(userId, limit)`
- `getFollowing(userId, limit)`
- `followUser(userId)`
- `unfollowUser(userId)`

### Feed & Posts
- `getTimelineFeed(limit)`
- `getUserFeed(userId, limit)`
- `likePost(mediaId)`
- `unlikePost(mediaId)`
- `commentPost(mediaId, text)`
- `getMediaInfo(mediaId)`
- `deletePost(mediaId)`

### Uploads
- `uploadPhoto(photoPath, caption)`
- `uploadStory(photoPath)`

### Events
- `on('message', callback)`
- `on('error', callback)`
- `dm.startPolling(interval)`
- `dm.stopPolling()`

</details>

---

## ❌ Known Limitations

Due to Instagram API restrictions:
- ❌ **Video DMs are disabled** - Instagram deprecated the video DM endpoint
- ❌ **Voice notes are disabled** - Instagram deprecated the voice note endpoint
- ✅ **Photos work perfectly** - Including from URLs with auto-processing

---

## 🐛 Troubleshooting

### Login Failed / Challenge Required
- Use cookie authentication instead
- Your account may require 2FA or CAPTCHA verification
- Try logging in from the Instagram app first

### "Checkpoint Required" Error
- Instagram detected automated behavior
- Complete the checkpoint in the Instagram app or website
- Wait 24-48 hours before trying again

### Photos Not Sending
- Check image format (JPG/PNG supported)
- Images are auto-resized to 1080px max
- Large files are auto-compressed

### Rate Limiting
- Add delays between requests (3-5 seconds recommended)
- Don't send too many messages in a short time
- Instagram limits vary by account age and activity

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## ⭐ Support

If you find this library helpful, please give it a star on GitHub!

---

## 🔗 Links

- [GitHub Repository](https://github.com/NeoKEX/neokex-ica)
- [npm Package](https://www.npmjs.com/package/neokex-ica)
- [Report Issues](https://github.com/NeoKEX/neokex-ica/issues)
