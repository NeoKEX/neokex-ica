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
- 💬 Send and receive direct messages
- 📨 Event-based message listening
- 🔄 Real-time message polling
- 👥 Thread management
- ✅ Message read receipts
- 🤖 Easy bot creation
- ⏱️ Rate limiting protection

## Installation

```bash
npm install neokex-ica
```

## Quick Start

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
Triggered when rate limited by Instagram.

```javascript
bot.onRateLimit((data) => {
  console.log(`Rate limited. Retry after ${data.retryAfter}s`);
});
```

## Complete Example

```javascript
import InstagramChatAPI from 'neokex-ica';

const bot = new InstagramChatAPI();

async function main() {
  try {
    await bot.login('your_username', 'your_password');
    console.log('Logged in successfully!');

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

    const recentMessages = await bot.getRecentMessages(5);
    console.log(`Found ${recentMessages.length} recent messages`);

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

## Running the Example

```bash
npm start
```

Or with credentials:

```bash
INSTAGRAM_USERNAME=your_user INSTAGRAM_PASSWORD=your_pass npm start
```

## License

MIT

## Warning

This package is for educational purposes. Instagram's Terms of Service prohibit automated access to their platform. Using this package may result in your Instagram account being banned or restricted. Use at your own risk.
