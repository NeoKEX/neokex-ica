# neokex-ica v2.0

**Professional Instagram Chat API with Full Media Support**

A powerful, production-ready Instagram Chat API for building bots with complete media upload capabilities (photos, videos, voice notes). Built with real Instagram mobile app implementations extracted from battle-tested libraries.

## ⚠️ Important Disclaimer

This is an **unofficial API** that uses Instagram's private/undocumented endpoints. Using this may violate Instagram's Terms of Service and could result in account restrictions or bans. **Use at your own risk and only for educational purposes.**

---

## 🚀 What's New in v2.0

- ✅ **Real media uploads** - Photos, videos, and voice notes now work!
- ✅ **Production signature keys** - Real HMAC-SHA256 keys from Instagram APK
- ✅ **Complete upload flow** - Proper rupload implementation with all steps
- ✅ **Enhanced reliability** - Extracted from most reliable Instagram libraries
- ✅ **Standalone** - No external dependencies or REST APIs needed

---

## 📦 Features

### 🔐 Authentication
- **Username/password login** with professional-grade pre-login flow
- **Cookie-based authentication** (Netscape format) - **RECOMMENDED**
- **Session management** - Save/load complete session state
- **Error handling** - 401, 429, 2FA, challenge detection

### 💬 Full Messaging Capabilities
- ✅ **Send text messages** to threads or users
- ✅ **Send photos** - Real upload with rupload flow
- ✅ **Send videos** - Complete video processing pipeline
- ✅ **Send voice notes** - Waveform generation included
- ✅ **Send stickers** by ID
- ✅ **Send links** with preview
- ✅ **React to messages** with emojis
- ✅ **Remove reactions**
- ✅ **Unsend messages**
- ✅ **Mark as seen/read**

### 👥 Thread Management
- Get inbox and specific threads
- Mute/unmute threads
- Archive/unarchive threads
- Delete threads
- Leave group threads
- Add/remove users from threads
- Update thread titles
- Approve pending message requests

### 📊 User & Info Methods
- Get current user ID and username
- Get user info by ID or username
- Search users
- Real-time message polling with events

### 🎭 Interactive Features
- Typing indicators (send and detect)
- Event-based message listening
- Pending request notifications
- Error and rate limit event handlers

---

## 📥 Installation

```bash
npm install
```

---

## 🎯 Quick Start

### Option 1: Cookie-Based Authentication (Recommended)

```javascript
import InstagramChatAPI from './src/index.js';

const bot = new InstagramChatAPI();

// Export cookies from your browser using an extension
// Chrome: "Get cookies.txt" extension
// Firefox: "cookies.txt" extension
bot.loadCookiesFromFile('./cookies.txt');

// Send text message
await bot.sendMessage('thread_id', 'Hello!');

// Send photo ✅ WORKS!
await bot.sendPhoto('thread_id', './photo.jpg');

// Send video ✅ WORKS!
await bot.sendVideo('thread_id', './video.mp4', { duration: 5000 });

// Send voice note ✅ WORKS!
await bot.sendVoiceNote('thread_id', './audio.m4a', { duration: 3000 });

// Get inbox
const inbox = await bot.getInbox();
console.log(`You have ${inbox.threads.length} conversations`);
```

### Option 2: Username/Password Login

```javascript
import InstagramChatAPI from './src/index.js';

const bot = new InstagramChatAPI();

// Login
await bot.login('your_username', 'your_password');

// Save session for reuse
const session = await bot.getSessionState();
fs.writeFileSync('session.json', JSON.stringify(session));

// Use the bot
await bot.sendMessage('thread_id', 'Hello from neokex-ica!');
```

---

## 📖 API Reference

### Initialization

```javascript
const bot = new InstagramChatAPI({
  showBanner: true  // Show version banner (default: true)
});
```

### Authentication

```javascript
// Username/password login
await bot.login(username, password);

// Cookie-based authentication (recommended)
bot.loadCookiesFromFile('./cookies.txt');
bot.saveCookiesToFile('./cookies.txt');

// Session management
const session = await bot.getSessionState();
bot.loadSessionState(session);
```

### Messaging

```javascript
// Send text message
await bot.sendMessage(threadId, text);
await bot.sendMessageToUser(userId, text);

// Send media (all working!)
await bot.sendPhoto(threadId, './photo.jpg');
await bot.sendVideo(threadId, './video.mp4', {
  duration: 5000,  // milliseconds
  width: 720,
  height: 1280
});
await bot.sendVoiceNote(threadId, './audio.m4a', {
  duration: 3000,  // milliseconds
  waveform: [0.1, 0.5, 0.8, ...]  // optional
});

// Other message types
await bot.sendSticker(threadId, stickerId);
await bot.sendLink(threadId, 'https://example.com', 'Check this out');
await bot.sendReaction(threadId, messageId, '❤️');
await bot.removeReaction(threadId, messageId);
await bot.unsendMessage(threadId, messageId);
```

### Inbox & Threads

```javascript
// Get inbox
const inbox = await bot.getInbox();

// Get specific thread
const thread = await bot.getThread(threadId);

// Get recent messages
const messages = await bot.getRecentMessages(limit);

// Mark as seen
await bot.markAsSeen(threadId, messageId);

// Thread management
await bot.muteThread(threadId);
await bot.unmuteThread(threadId);
await bot.archiveThread(threadId);
await bot.unarchiveThread(threadId);
await bot.deleteThread(threadId);
await bot.leaveThread(threadId);

// Group management
await bot.addUsersToThread(threadId, [userId1, userId2]);
await bot.removeUserFromThread(threadId, userId);
await bot.updateThreadTitle(threadId, 'New Title');

// Pending requests
await bot.approveThread(threadId);
```

### User Info

```javascript
// Get current user
const userId = bot.getCurrentUserID();
const username = bot.getCurrentUsername();

// Get other users
const user = await bot.getUserInfo(userId);
const user = await bot.getUserInfoByUsername('instagram');
```

### Real-Time Events

```javascript
// Listen for new messages
bot.onMessage((message) => {
  console.log(`From ${message.userId}: ${message.text}`);
});

// Typing indicators
bot.onTyping((typing) => {
  console.log(`${typing.userId} is typing...`);
});

// Pending requests
bot.onPendingRequest((request) => {
  console.log(`${request.threads.length} new message requests`);
});

// Errors and rate limits
bot.onError((error) => console.error(error));
bot.onRateLimit((info) => console.log(`Rate limited for ${info.retryAfter}s`));

// Start listening
await bot.startListening(5000); // Poll every 5 seconds

// Stop listening
bot.stopListening();
```

---

## 🧪 Testing

Run the comprehensive test suite:

```bash
# Make sure you have cookies.txt in the root directory
node test-media-upload.js
```

The test will:
- Load your cookies
- Get your inbox
- Send a text message
- Send a photo (if `test-image.jpg` exists)
- Send a video (if `test-video.mp4` exists)
- Send a voice note (if `test-audio.m4a` exists)

---

## 🔒 Security Best Practices

1. **Never commit credentials**
   ```javascript
   // Use environment variables
   const username = process.env.INSTAGRAM_USERNAME;
   const password = process.env.INSTAGRAM_PASSWORD;
   ```

2. **Cookies and sessions are in .gitignore**
   - `cookies.txt`
   - `session.json`
   - `*.session`

3. **Use cookie-based auth in production**
   - More reliable than username/password
   - Bypasses 2FA and challenges
   - Less likely to trigger security checks

4. **Implement rate limiting**
   - Don't exceed ~100 actions/hour
   - Add delays between requests (2-5 seconds)
   - Use proxies for production

---

## ⚙️ Technical Details

### Real Implementation Sources

This library integrates actual working code extracted from:
- **Signature Key**: `9193488027538fd3450b83b7d05286d4ca9599a0f7eeed90d8c85925698a05dc`
- **App Version**: 222.0.0.13.114
- **Upload Flow**: Complete rupload implementation
- **Error Handling**: Comprehensive Instagram response handling

### Media Upload Process

**Photos:**
1. Upload to `/rupload_igphoto/` endpoint
2. Broadcast with `configure_photo` using `upload_id`

**Videos:**
1. Upload to `/rupload_igvideo/` endpoint
2. Call `/media/upload_finish/` for processing
3. Broadcast with `configure_video` using `upload_id`

**Voice Notes:**
1. Upload as video with `mediaType: '11'`
2. Call `/media/upload_finish/` with `sourceType: '4'`
3. Broadcast with `share_voice` including waveform

---

## 🚫 Limitations & Known Issues

1. **Instagram ToS**: This violates Instagram's Terms of Service
2. **Account Risk**: Expect potential account bans
3. **API Changes**: Instagram changes their API frequently
4. **No Official Support**: This is reverse-engineered, no guarantees
5. **Rate Limiting**: Instagram aggressively limits automation

---

## 📚 Documentation

- `THIRD_PARTY_INTEGRATION_GUIDE.md` - How features were extracted
- `RELIABLE_LIBRARIES_COMPARISON.md` - Comparison of available libraries
- `IMPLEMENTATION_NOTES.md` - Production deployment notes
- `QUICK_START.md` - Detailed setup guide

---

## 🎉 What Makes This Different

Unlike other Instagram libraries:
- ✅ **All media uploads work** - Not just placeholders
- ✅ **Real signature keys** - Extracted from Instagram APK
- ✅ **Complete upload flow** - Proper rupload + uploadFinish + broadcast
- ✅ **Production-ready** - Based on battle-tested implementations
- ✅ **Standalone** - No external REST APIs or services needed
- ✅ **Clean codebase** - Well-structured and documented

---

## ⚖️ Legal & Ethical Considerations

- **Terms of Service**: This violates Instagram's ToS
- **Spam Prevention**: Don't send unsolicited messages
- **Privacy**: Respect user privacy, don't scrape data
- **Rate Limits**: Don't abuse Instagram's servers
- **Account Safety**: Expect account bans if detected

---

## 🤝 Contributing

This is a personal project for educational purposes. No contributions are accepted.

---

## 📄 License

MIT License - Use at your own risk

---

## 🙏 Acknowledgments

Implementation extracted from various open-source Instagram libraries. All credit goes to the original researchers and developers who reverse-engineered Instagram's private API.

---

**Made with ❤️ for educational purposes only**

*Use responsibly and at your own risk!*
