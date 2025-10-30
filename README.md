# Neokex-ICA

**Unofficial Instagram Chat API for Building Bots**

⚠️ **IMPORTANT DISCLAIMERS**:

1. **Terms of Service**: This is an unofficial API that uses reverse-engineered Instagram endpoints. Using this may violate Instagram's Terms of Service and could result in account restrictions or bans. Use at your own risk.

2. **Framework/Starting Point**: This package provides an architectural foundation and framework for Instagram bot development. However, Instagram's private API requires:
   - **Advanced reverse engineering**: Payload signing with HMAC, signature keys (framework included, key requires reverse engineering)
   - **Specific authentication**: Signed bodies, correct enc_password formats, device fingerprinting (implemented)
   - **Constant updates**: Instagram frequently changes their API to prevent automation
   - **Traffic analysis**: Studying actual Instagram mobile app traffic to understand current requirements
   - **Additional libraries**: Crypto libraries for signing (included), proper session management (implemented), proxy support

3. **Current Status**: This package provides:
   - ✅ Clean API structure and event-based architecture (40 methods - comparable to ws3-fca)
   - ✅ **Professional-grade login flow** with pre-login and comprehensive headers
   - ✅ **Production-ready error handling** (401, 429, 2FA detection, challenges)
   - ✅ **Complete HTTP request handling** with all Instagram mobile app headers
   - ✅ **Advanced session management** (save/load with all device IDs)
   - ✅ Cookie-based authentication (Netscape format) - **RECOMMENDED FOR PRODUCTION**
   - ✅ Payload signing utilities (HMAC-SHA256 framework ready)
   - ✅ Text messaging with proper authentication
   - ✅ Complete method signatures for all messaging and thread operations
   - ⚠️ Media methods (photo/video/voice/sticker) require proper upload implementation
   - ⚠️ Payload signing needs Instagram's signature key (requires APK reverse engineering)
   
   **To make this production-ready**: Use cookie-based authentication (recommended). For username/password login, see IMPLEMENTATION_NOTES.md for signature key extraction. Media uploads need proper Instagram upload flows (not direct URLs).

## Features

### 🔐 Authentication & Session
- **Professional-grade username/password login** with pre-login flow
- **Cookie-based authentication (Netscape format)** - RECOMMENDED
- **Advanced session state management** (save/load all device IDs)
- **Comprehensive error handling** (401, 429, 2FA, challenges)
- **Production-ready headers** (X-IG-Capabilities, X-IG-Connection-Type, etc.)
- **Zero client-side rate limiting** - requests are never throttled or delayed

### 💬 Messaging Capabilities
- **Send text messages** to threads or users ✅
- **Send photos** and images (framework - needs upload implementation)
- **Send videos** (framework - needs upload implementation)
- **Send voice notes** (framework - needs upload implementation)
- **Send stickers** by ID (framework)
- **Send links** with optional text (framework)
- **React to messages** with emojis (framework)
- **Remove reactions** from messages (framework)
- **Unsend messages** (delete sent messages - framework)
- **Mark messages as seen/read** ✅

### 👥 Thread Management
- Get inbox and specific threads
- **Mute/unmute** threads
- **Archive/unarchive** threads
- **Delete threads**
- **Leave group threads**
- **Add/remove users** from threads
- **Update thread title**
- Approve pending message requests

### 📊 User & Info Methods
- **Get current user ID** and username
- **Get user info** by ID or username
- Search users
- Real-time message polling

### 🎭 Interactive Features
- **Typing indicators** (send and detect typing status)
- Event-based message listening
- Pending request notifications
- Error and rate limit event handlers

## Installation

```bash
npm install neokex-ica
```

## Quick Start

### Option 1: Cookie-Based Authentication (Recommended)

```javascript
import InstagramChatAPI from 'neokex-ica';

const bot = new InstagramChatAPI();

bot.loadCookiesFromFile('./cookies.txt');

bot.onMessage(async (msg) => {
  console.log(`New message: ${msg.text}`);
  await bot.sendMessage(msg.threadId, 'Auto reply!');
});

await bot.startListening();
```

### Option 2: Username/Password Login

```javascript
import InstagramChatAPI from 'neokex-ica';

const bot = new InstagramChatAPI();

await bot.login('your_username', 'your_password');

bot.onMessage(async (msg) => {
  console.log(`New message: ${msg.text}`);
  await bot.sendMessage(msg.threadId, 'Auto reply!');
});

await bot.startListening();
```

## API Reference

### Class: InstagramChatAPI

#### Methods

##### `login(username, password)`
Login to Instagram account with professional-grade authentication flow.

**Features:**
- Pre-login flow for initial CSRF tokens
- Comprehensive Instagram mobile app headers
- Proper error handling for 2FA, challenges, rate limits
- Automatic cookie and session management

**Note:** Cookie-based authentication is recommended for production. See `loadCookiesFromFile()`.

```javascript
try {
  const result = await bot.login('username', 'password');
  console.log(`Logged in as ${result.username} (ID: ${result.userId})`);
} catch (error) {
  if (error.message.includes('Two-factor')) {
    console.log('2FA required - use cookie-based auth instead');
  } else if (error.message.includes('Challenge')) {
    console.log('Account verification needed - login through Instagram app first');
  } else if (error.message.includes('Rate limited')) {
    console.log('Too many attempts - wait before retrying');
  } else {
    console.error('Login failed:', error.message);
  }
}
```

##### `sendMessage(threadId, text)`
Send a message to a specific thread.

```javascript
await bot.sendMessage('thread_id_here', 'Hello!');
```

##### `sendMessageToUser(userId, text)`
Send a direct message to a user by their ID.

```javascript
await bot.sendMessageToUser('user_id_here', 'Hi there!');
```

##### `getInbox()`
Get the current inbox with all threads.

```javascript
const inbox = await bot.getInbox();
```

##### `getThread(threadId)`
Get details of a specific thread.

```javascript
const thread = await bot.getThread('thread_id_here');
```

##### `startListening(interval = 5000)`
Start polling for new messages (default: 5 seconds).

```javascript
await bot.startListening(3000);
```

##### `stopListening()`
Stop polling for messages.

```javascript
bot.stopListening();
```

##### `getRecentMessages(limit = 20)`
Get recent messages from inbox.

```javascript
const messages = await bot.getRecentMessages(10);
```

##### `markAsSeen(threadId, itemId)`
Mark a message as seen.

```javascript
await bot.markAsSeen(msg.threadId, msg.itemId);
```

##### `approveThread(threadId)`
Approve a pending message request.

```javascript
await bot.approveThread('thread_id_here');
```

##### `loadCookiesFromFile(filePath)`
Load cookies from a Netscape format cookie file.

```javascript
bot.loadCookiesFromFile('./cookies.txt');
```

##### `saveCookiesToFile(filePath, domain = '.instagram.com')`
Save current cookies to a Netscape format file.

```javascript
bot.saveCookiesToFile('./cookies.txt');
```

##### `setCookies(cookies)`
Manually set cookies from an object.

```javascript
bot.setCookies({
  sessionid: 'your_session_id',
  csrftoken: 'your_csrf_token',
  ds_user_id: 'your_user_id'
});
```

##### `getCookies()`
Get current cookies as an object.

```javascript
const cookies = bot.getCookies();
console.log(cookies);
```

##### `getCurrentUserID()`
Get the bot's Instagram user ID.

```javascript
const userId = bot.getCurrentUserID();
console.log(`Bot User ID: ${userId}`);
```

##### `getCurrentUsername()`
Get the bot's Instagram username.

```javascript
const username = bot.getCurrentUsername();
console.log(`Bot Username: ${username}`);
```

##### `getUserInfo(userId)`
Get detailed information about a user by their ID.

```javascript
const userInfo = await bot.getUserInfo('123456789');
console.log(userInfo);
```

##### `getUserInfoByUsername(username)`
Get detailed information about a user by their username.

```javascript
const userInfo = await bot.getUserInfoByUsername('instagram');
console.log(userInfo);
```

##### `getSessionState()`
Get the complete session state for saving.

```javascript
const sessionState = await bot.getSessionState();
// Save to file for later use
fs.writeFileSync('session.json', JSON.stringify(sessionState));
```

##### `loadSessionState(sessionState)`
Load a previously saved session state.

```javascript
const sessionState = JSON.parse(fs.readFileSync('session.json'));
bot.loadSessionState(sessionState);
```

### Advanced Messaging Methods

##### `sendPhoto(threadId, photoUrl)`
Send a photo to a thread.

**Note:** This is a framework method. Instagram requires proper media upload flows (upload to Instagram, get upload_id, then send). See IMPLEMENTATION_NOTES.md for details.

```javascript
await bot.sendPhoto(threadId, uploadId); // Needs upload_id, not direct URL
```

##### `sendVideo(threadId, videoUrl)`
Send a video to a thread.

**Note:** Framework method - requires proper Instagram video upload implementation.

```javascript
await bot.sendVideo(threadId, uploadId);
```

##### `sendVoiceNote(threadId, audioUrl)`
Send a voice note to a thread.

**Note:** Framework method - requires proper Instagram audio upload implementation.

```javascript
await bot.sendVoiceNote(threadId, uploadId);
```

##### `sendSticker(threadId, stickerId)`
Send a sticker to a thread by sticker ID.

**Note:** Framework method - requires valid Instagram sticker IDs.

```javascript
await bot.sendSticker(threadId, '123456789');
```

##### `sendLink(threadId, linkUrl, linkText)`
Send a link with optional preview text.

```javascript
await bot.sendLink(threadId, 'https://example.com', 'Check this out!');
```

##### `sendReaction(threadId, itemId, emoji)`
React to a message with an emoji.

```javascript
await bot.sendReaction(threadId, itemId, '❤️');
```

##### `removeReaction(threadId, itemId)`
Remove your reaction from a message.

```javascript
await bot.removeReaction(threadId, itemId);
```

##### `unsendMessage(threadId, itemId)`
Delete a message you sent.

```javascript
await bot.unsendMessage(threadId, itemId);
```

##### `indicateTyping(threadId, isTyping)`
Show typing indicator in a thread.

```javascript
// Start typing
await bot.indicateTyping(threadId, true);

// Stop typing
await bot.indicateTyping(threadId, false);
```

### Thread Management Methods

##### `muteThread(threadId)`
Mute notifications for a thread.

```javascript
await bot.muteThread(threadId);
```

##### `unmuteThread(threadId)`
Unmute notifications for a thread.

```javascript
await bot.unmuteThread(threadId);
```

##### `deleteThread(threadId)`
Delete a thread.

```javascript
await bot.deleteThread(threadId);
```

##### `archiveThread(threadId)`
Archive a thread.

```javascript
await bot.archiveThread(threadId);
```

##### `unarchiveThread(threadId)`
Unarchive a thread.

```javascript
await bot.unarchiveThread(threadId);
```

##### `leaveThread(threadId)`
Leave a group thread.

```javascript
await bot.leaveThread(threadId);
```

##### `addUsersToThread(threadId, userIds)`
Add users to a group thread.

```javascript
await bot.addUsersToThread(threadId, ['123456', '789012']);
```

##### `removeUserFromThread(threadId, userId)`
Remove a user from a group thread.

```javascript
await bot.removeUserFromThread(threadId, '123456');
```

##### `updateThreadTitle(threadId, title)`
Update the title of a group thread.

```javascript
await bot.updateThreadTitle(threadId, 'New Group Name');
```

#### Event Handlers

##### `onMessage(callback)`
Listen for new messages.

```javascript
bot.onMessage((msg) => {
  console.log(`${msg.text} from user ${msg.userId}`);
});
```

Message object structure:
```javascript
{
  threadId: string,
  itemId: string,
  userId: number,
  text: string,
  timestamp: number,
  thread: object,
  item: object
}
```

##### `onPendingRequest(callback)`
Listen for pending message requests.

```javascript
bot.onPendingRequest((data) => {
  console.log(`${data.threads.length} pending requests`);
});
```

##### `onError(callback)`
Listen for errors.

```javascript
bot.onError((error) => {
  console.error('Error:', error.message);
});
```

##### `onLogin(callback)`
Triggered after successful login.

```javascript
bot.onLogin((data) => {
  console.log(`Logged in as ${data.username}`);
});
```

##### `onRateLimit(callback)`
Listen for rate limit responses from Instagram's server.

**Important:** This API has **ZERO client-side rate limiting**. All requests are sent immediately without any delays or throttling. This event only notifies you when Instagram's server returns a 429 (rate limit) response - it does NOT block or delay your requests.

```javascript
bot.onRateLimit((data) => {
  console.log(`Instagram server returned rate limit. Retry after ${data.retryAfter}s`);
  // Note: The API will NOT automatically delay requests - handle as needed
});
```

##### `onTyping(callback)`
Detect when someone is typing in a thread.

```javascript
bot.onTyping((data) => {
  console.log(`User ${data.userId} is typing in thread ${data.threadId}`);
});
```

## Cookie Format

This package supports Netscape HTTP Cookie File format. You can export cookies from your browser using extensions like:
- **Chrome/Edge**: "Get cookies.txt" extension
- **Firefox**: "cookies.txt" extension

The cookie file should look like this:

```
# Netscape HTTP Cookie File
.instagram.com  TRUE    /       TRUE    1893456000      sessionid       your_session_id_here
.instagram.com  TRUE    /       TRUE    1893456000      csrftoken       your_csrf_token_here
.instagram.com  TRUE    /       TRUE    1893456000      ds_user_id      your_user_id_here
```

**Required cookies:**
- `sessionid` - Your Instagram session ID
- `csrftoken` - CSRF token for requests
- `ds_user_id` - Your Instagram user ID

## Complete Example (With Cookies)

```javascript
import InstagramChatAPI from 'neokex-ica';

const bot = new InstagramChatAPI();

async function main() {
  try {
    bot.loadCookiesFromFile('./cookies.txt');
    console.log('Cookies loaded successfully!');

    bot.onMessage(async (msg) => {
      console.log(`New message: ${msg.text}`);
      
      if (msg.text.toLowerCase().includes('hello')) {
        await bot.sendMessage(msg.threadId, 'Hello! How can I help you?');
      }
      
      await bot.markAsSeen(msg.threadId, msg.itemId);
    });

    bot.onError((error) => {
      console.error('Error:', error.message);
    });

    const inbox = await bot.getInbox();
    console.log(`Found ${inbox.threads.length} threads`);

    bot.saveCookiesToFile('./cookies.txt');

    await bot.startListening(5000);
    
  } catch (error) {
    console.error('Fatal error:', error.message);
  }
}

main();
```

## Environment Variables

For security, use environment variables for credentials:

```bash
export INSTAGRAM_USERNAME="your_username"
export INSTAGRAM_PASSWORD="your_password"
```

Then in your code:

```javascript
await bot.login(
  process.env.INSTAGRAM_USERNAME,
  process.env.INSTAGRAM_PASSWORD
);
```

## Publishing to npm

Before publishing, update `package.json` with your information:
- `author`: Your name and email
- `repository.url`: Your GitHub repository URL
- `bugs.url`: Your GitHub issues URL
- `homepage`: Your GitHub homepage URL

Then publish to npm:

```bash
# Login to npm (one time only)
npm login

# Publish the package
npm publish
```

## Installation in Your Project

Install from npm:
```bash
npm install neokex-ica
```

Or install from GitHub:
```bash
npm install github:your-username/neokex-ica
```

Or clone and link locally:
```bash
git clone https://github.com/your-username/neokex-ica.git
cd neokex-ica
npm install
npm link

# In your bot project
npm link neokex-ica
```

## License

MIT

## Warning

This package is for educational purposes. Instagram's Terms of Service prohibit automated access to their platform. Using this package may result in your Instagram account being banned or restricted. Use at your own risk.
