# Neokex-ICA

**Unofficial Instagram Chat API for Building Bots**

⚠️ **IMPORTANT DISCLAIMERS**:

1. **Terms of Service**: This is an unofficial API that uses reverse-engineered Instagram endpoints. Using this may violate Instagram's Terms of Service and could result in account restrictions or bans. Use at your own risk.

2. **Framework/Starting Point**: This package provides an architectural foundation and framework for Instagram bot development. However, Instagram's private API requires:
   - **Advanced reverse engineering**: Payload signing with HMAC, signature keys, pre-login flows
   - **Specific authentication**: Signed bodies, correct enc_password formats, device fingerprinting
   - **Constant updates**: Instagram frequently changes their API to prevent automation
   - **Traffic analysis**: Studying actual Instagram mobile app traffic to understand current requirements
   - **Additional libraries**: Crypto libraries for signing, proper session management, proxy support

3. **Current Status**: This package provides:
   - ✅ Clean API structure and event-based architecture
   - ✅ Basic HTTP request handling and session management
   - ✅ Complete method signatures for all DM operations
   - ⚠️ Simplified authentication (needs advanced signing implementation)
   - ⚠️ Basic payload formats (may need additional fields/signatures)
   
   **To make this production-ready**, you'll need to research Instagram's current private API requirements and implement proper payload signing and authentication flows.

## Features

- 🔐 Login and session management
- 🍪 **Netscape cookie format support** (load/save cookies from file)
- 💬 Send and receive direct messages
- 📨 Event-based message listening
- 🔄 Real-time message polling
- 👥 Thread management
- ✅ Message read receipts
- 🤖 Easy bot creation
- 🚀 No client-side rate limiting restrictions

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
Login to Instagram account.

```javascript
await bot.login('username', 'password');
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
Listen for rate limit responses from Instagram (if any are returned by the server).

**Note:** The client does not enforce rate limiting, but Instagram's servers may still return rate limit errors. This event allows you to handle such cases.

```javascript
bot.onRateLimit((data) => {
  console.log(`Rate limited by Instagram server. Retry after ${data.retryAfter}s`);
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

## Installation in Your Project

Install from GitHub:
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
