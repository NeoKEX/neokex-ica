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
- ✅ **Text Messages** - Send to threads or users with reply support
- ✅ **Photo/Video Uploads** - Send media from files or URLs with auto-processing
- ✅ **GIFs & Animated Media** - Send GIFs and animated stickers
- ✅ **Link Sharing** - Share URLs with previews
- ✅ **Reactions** - React to messages with emojis
- ✅ **Message Editing** - Edit sent messages
- ✅ **Unsend Messages** - Delete sent messages
- ✅ **Mark as Seen** - Read receipts
- ✅ **onReply Handlers** - Advanced callback pattern for handling replies (like ws3-fca)
- ✅ **Media Download** - Extract and download video/image URLs from messages
- ✅ **Message Forwarding** - Forward media between threads

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
await bot.sendMessage(threadId, 'Hello!');

// Send text message with reply to another message
await bot.sendMessage(threadId, 'Reply text', { replyToItemId: 'message_id' });

// Send text message to user (creates thread if needed)
await bot.sendMessageToUser(userId, 'Hello!');

// Send photo from file
await bot.sendPhoto(threadId, './image.jpg');

// Send photo from URL
await bot.sendPhotoFromUrl(threadId, 'https://example.com/image.jpg');

// Send video from URL
await bot.sendVideoFromUrl(threadId, 'https://example.com/video.mp4');

// Send GIF
await bot.sendGif(threadId, 'giphy_id');

// Send animated media
await bot.sendAnimatedMedia(threadId, 'media_id');

// Share media to thread
await bot.shareMediaToThread(threadId, 'media_id', 'Optional message');

// Send link
await bot.sendLink(threadId, 'https://example.com', 'Check this out!');

// Send sticker
await bot.sendSticker(threadId, 'sticker_id');

// React to message
await bot.sendReaction(threadId, itemId, '❤️');

// Remove reaction
await bot.removeReaction(threadId, itemId);

// Edit message
await bot.editMessage(threadId, itemId, 'New text');

// Unsend message
await bot.unsendMessage(threadId, itemId);

// Mark message as seen
await bot.markAsSeen(threadId, itemId);

// Show typing indicator
await bot.indicateTyping(threadId, true);
```

### Advanced Messaging - onReply Callbacks (like ws3-fca)

```javascript
// Send message and wait for reply
await bot.sendMessageWithReply(threadId, 'What is your name?', async (replyEvent) => {
  const userName = replyEvent.text;
  await bot.sendMessage(replyEvent.thread_id, `Nice to meet you, ${userName}!`);
});

// Or register reply handler manually
const result = await bot.sendMessage(threadId, 'Pick a number: 1, 2, or 3');
bot.registerReplyHandler(result.item_id, async (replyEvent) => {
  const choice = replyEvent.text;
  await bot.sendMessage(threadId, `You chose: ${choice}`);
});

// Clear a reply handler
bot.clearReplyHandler(itemId);
```

### Media Download & URLs

```javascript
// Get media URLs from a message (supports images, videos, carousels)
const mediaInfo = await bot.getMessageMediaUrl(threadId, itemId);
console.log(mediaInfo.media.videos); // Array of video URLs with different qualities
console.log(mediaInfo.media.images); // Array of image URLs

// Download media from a message
const downloaded = await bot.downloadMessageMedia(threadId, itemId, './save/path.mp4');
console.log(`Downloaded to: ${downloaded.path}`);
console.log(`File size: ${downloaded.size} bytes`);
console.log(`Download URL: ${downloaded.url}`);

// Forward message to another thread
await bot.forwardMessage(fromThreadId, toThreadId, itemId);
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

### Auto-Reply Bot with onReply (Enhanced)

```javascript
import InstagramChatAPI from 'neokex-ica';

const bot = new InstagramChatAPI();
await bot.loadCookiesFromFile('./cookies.txt');

// Listen for new messages
bot.on('message', async (message) => {
  const { thread_id, text, is_from_me } = message;
  
  // Don't reply to yourself
  if (is_from_me) return;
  
  // Auto-reply with onReply callback
  if (text.toLowerCase().includes('hello')) {
    await bot.sendMessageWithReply(thread_id, 'Hi! What can I help you with?', async (reply) => {
      await bot.sendMessage(thread_id, `Got it! You said: "${reply.text}"`);
    });
  }
});

// Start polling for messages every 5 seconds
await bot.startListening(5000);
```

### Interactive Menu Bot (onReply Pattern)

```javascript
import InstagramChatAPI from 'neokex-ica';

const bot = new InstagramChatAPI();
await bot.loadCookiesFromFile('./cookies.txt');

bot.on('message', async (msg) => {
  if (msg.is_from_me) return;
  
  if (msg.text === '!menu') {
    await bot.sendMessageWithReply(
      msg.thread_id,
      '📋 Menu:\n1. View Products\n2. Support\n3. Pricing\n\nReply with a number:',
      async (reply) => {
        const choice = reply.text.trim();
        if (choice === '1') {
          await bot.sendMessage(reply.thread_id, '🛍️ Here are our products...');
        } else if (choice === '2') {
          await bot.sendMessage(reply.thread_id, '💬 Contact support at...');
        } else if (choice === '3') {
          await bot.sendMessage(reply.thread_id, '💰 Our pricing: $10/month');
        } else {
          await bot.sendMessage(reply.thread_id, '❌ Invalid choice. Try !menu again');
        }
      },
      { replyTimeout: 60000 } // 1 minute timeout
    );
  }
});

await bot.startListening(5000);
```

### Media Download Bot

```javascript
import InstagramChatAPI from 'neokex-ica';

const bot = new InstagramChatAPI();
await bot.loadCookiesFromFile('./cookies.txt');

bot.on('message', async (msg) => {
  if (msg.is_from_me) return;
  
  // When user sends media, download it
  if (msg.message.media) {
    try {
      const mediaUrls = await bot.getMessageMediaUrl(msg.thread_id, msg.item_id);
      
      if (mediaUrls.media.videos && mediaUrls.media.videos.length > 0) {
        console.log('Video URLs:', mediaUrls.media.videos);
        
        // Download the video
        const downloaded = await bot.downloadMessageMedia(msg.thread_id, msg.item_id);
        console.log(`Downloaded video to: ${downloaded.path}`);
        
        // Forward to another thread
        await bot.forwardMessage(msg.thread_id, 'another_thread_id', msg.item_id);
      }
    } catch (error) {
      console.error('Media download error:', error.message);
    }
  }
});

await bot.startListening(5000);
```

### Send Photo/Video from URL

```javascript
// Send photo from URL
const photoUrl = 'https://picsum.photos/800/600';
await bot.sendPhotoFromUrl(threadId, photoUrl);

// Send video from URL (streaming support)
const videoUrl = 'https://example.com/video.mp4';
await bot.sendVideoFromUrl(threadId, videoUrl);
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

## 📋 Available Methods (80+)

<details>
<parameter name="summary">Click to expand full method list

---

## 🚀 What's New in v2.1

- ✅ **onReply Callbacks** - Advanced reply handling like ws3-fca/fca-unofficial
- ✅ **Reply to Messages** - Send messages as replies to other messages
- ✅ **Message Editing** - Edit sent messages
- ✅ **Media Download** - Extract and download video/image URLs from DMs
- ✅ **GIF Support** - Send GIFs and animated media
- ✅ **Video Streaming** - Send videos from URLs with streaming support
- ✅ **Message Forwarding** - Forward media between threads
- ✅ **Fixed Polling** - Messages now show in real-time without needing to refresh
- ✅ **Better Event Tracking** - No duplicate message emissions
- ✅ **Complete Method Implementations** - All stub methods now fully functional

## ❌ Known Limitations

Due to Instagram API restrictions:
- ⚠️ **Voice notes** - Limited support due to Instagram API restrictions
- ✅ **Photos work perfectly** - Including from URLs with auto-processing
- ✅ **Videos supported** - Send from files and URLs with streaming support
- ✅ **GIFs supported** - Full Giphy integration

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
