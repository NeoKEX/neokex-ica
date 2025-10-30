# How to Create an Instagram Bot

## Quick Start Guide

### 1. Get Your Instagram Cookies

You need to export your Instagram cookies to authenticate:

**Option A: Using Browser Extension (Recommended)**
1. Install "Get cookies.txt" extension for Chrome/Firefox
2. Go to instagram.com and login
3. Click the extension and export cookies
4. Save as `cookies.txt` in this directory

**Option B: Using EditThisCookie (Chrome)**
1. Install EditThisCookie extension
2. Login to instagram.com
3. Click extension → Export → Netscape format
4. Save as `cookies.txt`

### 2. Run the Example Bot

```bash
node bot-example.js
```

The bot will:
- ✅ Auto-approve pending message requests
- ✅ Respond to "hello", "help", "time", "joke" commands
- ✅ React with 👍 to other messages
- ✅ Show typing indicators
- ✅ Display professional logs with colors

### 3. Create Your Own Bot

```javascript
import InstagramChatAPI from './src/index.js';

const bot = new InstagramChatAPI();

// Load authentication
await bot.loadCookiesFromFile('./cookies.txt');

// Listen for messages
bot.onMessage(async (message) => {
  console.log('New message:', message.text);
  
  // Reply to the message
  await bot.sendMessage(message.threadId, 'Thanks for your message!');
  
  // Add a reaction
  await bot.sendReaction(message.threadId, message.itemId, '❤️');
});

// Start listening for new messages (check every 5 seconds)
await bot.startListening(5000);
```

## Available Features

### 📨 Messaging
```javascript
// Send text message
await bot.sendMessage(threadId, 'Hello!');

// Send to specific user
await bot.sendMessageToUser(userId, 'Hi there!');

// Send photo
await bot.sendPhoto(threadId, 'https://example.com/image.jpg');

// Send video
await bot.sendVideo(threadId, 'https://example.com/video.mp4');

// Send voice note
await bot.sendVoiceNote(threadId, 'https://example.com/audio.mp3');

// Send sticker
await bot.sendSticker(threadId, stickerId);

// Send link
await bot.sendLink(threadId, 'https://example.com', 'Check this out!');
```

### 💬 Reactions & Management
```javascript
// React to message
await bot.sendReaction(threadId, itemId, '❤️');

// Remove reaction
await bot.removeReaction(threadId, itemId);

// Unsend message
await bot.unsendMessage(threadId, itemId);

// Mark as seen
await bot.markAsSeen(threadId, itemId);

// Show typing indicator
await bot.indicateTyping(threadId, true);
```

### 🧵 Thread Management
```javascript
// Mute/unmute thread
await bot.muteThread(threadId);
await bot.unmuteThread(threadId);

// Archive/unarchive
await bot.archiveThread(threadId);
await bot.unarchiveThread(threadId);

// Delete thread
await bot.deleteThread(threadId);

// Leave group chat
await bot.leaveThread(threadId);

// Add users to group
await bot.addUsersToThread(threadId, [userId1, userId2]);

// Remove user from group
await bot.removeUserFromThread(threadId, userId);

// Update group title
await bot.updateThreadTitle(threadId, 'New Title');
```

### 👤 User Information
```javascript
// Get user info by ID
const user = await bot.getUserInfo(userId);

// Get user info by username
const user = await bot.getUserInfoByUsername('username');

// Search users
const users = await bot.searchUsers('search query');

// Get current user
const myId = bot.getCurrentUserID();
const myUsername = bot.getCurrentUsername();
```

### 📥 Inbox & Threads
```javascript
// Get inbox
const inbox = await bot.getInbox();

// Get specific thread
const thread = await bot.getThread(threadId);

// Get recent messages
const messages = await bot.getRecentMessages(20);

// Approve pending request
await bot.approveThread(threadId);
```

### 🎧 Event Listeners
```javascript
// Message received
bot.onMessage((message) => {
  console.log('From:', message.userId);
  console.log('Text:', message.text);
  console.log('Thread:', message.threadId);
});

// Typing indicator
bot.onTyping((data) => {
  console.log('User typing:', data.userId);
});

// Pending message request
bot.onPendingRequest((data) => {
  console.log('Pending threads:', data.threads.length);
});

// Login success
bot.onLogin((data) => {
  console.log('Logged in as:', data.username);
});

// Rate limit
bot.onRateLimit((data) => {
  console.log('Rate limited! Retry after:', data.retryAfter);
});

// Errors
bot.onError((error) => {
  console.error('Error:', error.message);
});
```

### 💾 Session Management
```javascript
// Save cookies to file
bot.saveCookiesToFile('./cookies.txt');

// Load cookies from file
bot.loadCookiesFromFile('./cookies.txt');

// Get session state (for backup)
const session = await bot.getSessionState();

// Restore session
bot.loadSessionState(session);

// Get/set cookies programmatically
const cookies = bot.getCookies();
bot.setCookies({ csrftoken: 'xxx', sessionid: 'yyy' });
```

## Bot Ideas

### 1. Auto-Responder Bot
Automatically reply to messages when you're away

### 2. Customer Service Bot
Handle FAQs and support requests automatically

### 3. Notification Bot
Send alerts and updates to users

### 4. Content Sharing Bot
Share photos, videos, or links automatically

### 5. Group Management Bot
Manage group chats, approve requests, etc.

### 6. Analytics Bot
Track and analyze message patterns

## Best Practices

✅ **Use cookie authentication** - More reliable than username/password
✅ **Handle rate limits** - Instagram may throttle your requests
✅ **Respect privacy** - Only automate with proper consent
✅ **Test carefully** - Start with small intervals (5-10 seconds)
✅ **Monitor errors** - Use the onError event listener
✅ **Save sessions** - Keep your authentication state

⚠️ **Important Notes**
- This is an unofficial API - use at your own risk
- Instagram may ban accounts that violate their Terms of Service
- Avoid aggressive automation or spam
- Consider rate limits and be respectful

## Troubleshooting

### "Not logged in" error
- Make sure your cookies.txt file exists and is valid
- Cookies expire after ~90 days, get fresh ones

### No messages received
- Check that startListening() is called
- Verify your polling interval (default 5000ms = 5 seconds)
- Make sure cookies are valid

### Rate limited
- Reduce polling frequency
- Add delays between actions
- The library has ZERO client-side rate limiting by design

## Support

For issues, questions, or feature requests, please open an issue on GitHub.

Happy botting! 🤖✨
