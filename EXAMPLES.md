# neokex-ica Examples

Complete examples for using the neokex-ica Instagram Chat API library.

## 📚 Table of Contents

- [Basic Setup](#basic-setup)
- [Authentication](#authentication)
- [Sending Messages](#sending-messages)
- [Media Sharing](#media-sharing)
- [Thread Management](#thread-management)
- [User Operations](#user-operations)
- [Building Bots](#building-bots)

---

## Basic Setup

### Installation

```bash
npm install neokex-ica
```

### Import

```javascript
import InstagramChatAPI from 'neokex-ica';
```

---

## Authentication

### Cookie-Based Login (Recommended)

```javascript
import InstagramChatAPI from 'neokex-ica';

const bot = new InstagramChatAPI();

// Load cookies from file (Netscape format)
await bot.loadCookiesFromFile('./cookies.txt');

console.log(`Logged in as: ${bot.getCurrentUsername()}`);
```

### Username/Password Login

```javascript
import InstagramChatAPI from 'neokex-ica';

const bot = new InstagramChatAPI();

try {
  await bot.login('username', 'password');
  console.log('Login successful!');
  
  // Save cookies for next time
  await bot.saveCookiesToFile('./cookies.txt');
} catch (error) {
  console.error('Login failed:', error.message);
}
```

---

## Sending Messages

### Send Text Message

```javascript
// To a thread
await bot.dm.sendMessage('thread_id', 'Hello!');

// To a user (creates thread if needed)
await bot.dm.sendMessageToUser('user_id', 'Hi there!');
```

### Send with Error Handling

```javascript
try {
  await bot.dm.sendMessageToUser('user_id', 'Hello!');
  console.log('✅ Message sent!');
} catch (error) {
  console.error('❌ Failed:', error.message);
}
```

---

## Media Sharing

### Send Photo from File

```javascript
await bot.dm.sendPhoto('thread_id', './photo.jpg');
```

### Send Photo from URL

```javascript
const photoUrl = 'https://picsum.photos/800/600';
await bot.dm.sendPhotoFromUrl('thread_id', photoUrl);
```

### Send Link

```javascript
await bot.dm.sendLink('thread_id', 
  'https://github.com/NeoKEX/neokex-ica',
  'Check out this awesome library!'
);
```

---

## Thread Management

### Get Inbox

```javascript
const inbox = await bot.getInbox();

inbox.threads.forEach(thread => {
  const username = thread.users?.[0]?.username || 'Unknown';
  console.log(`- @${username}`);
});
```

### Get Specific Thread

```javascript
const thread = await bot.dm.getThread('thread_id');
console.log(`Messages: ${thread.items.length}`);
```

### Mute/Unmute Thread

```javascript
// Mute
await bot.dm.muteThread('thread_id');

// Unmute
await bot.dm.unmuteThread('thread_id');
```

### Delete Thread

```javascript
await bot.dm.deleteThread('thread_id');
```

---

## User Operations

### Search Users

```javascript
const results = await bot.searchUsers('username');
results.forEach(user => {
  console.log(`@${user.username} - ${user.full_name}`);
});
```

### Get User Info

```javascript
// By ID
const user = await bot.getUserInfo('user_id');

// By username
const user = await bot.getUserInfoByUsername('instagram');

console.log(`
  Username: ${user.username}
  Name: ${user.full_name}
  Followers: ${user.follower_count}
  Following: ${user.following_count}
`);
```

### Follow/Unfollow

```javascript
// Follow
await bot.followUser('user_id');

// Unfollow
await bot.unfollowUser('user_id');
```

---

## Building Bots

### Auto-Reply Bot

```javascript
import InstagramChatAPI from 'neokex-ica';

const bot = new InstagramChatAPI();
await bot.loadCookiesFromFile('./cookies.txt');

// Listen for messages
bot.on('message', async (message) => {
  const { threadId, text, userId } = message;
  
  // Don't reply to yourself
  if (userId === bot.getCurrentUserID()) return;
  
  console.log(`New message: ${text}`);
  
  // Auto-reply
  await bot.dm.sendMessage(threadId, 
    `Thanks for your message! You said: "${text}"`
  );
});

// Start polling every 5 seconds
bot.dm.startPolling(5000);
console.log('Auto-reply bot started!');
```

### Keyword Bot

```javascript
import InstagramChatAPI from 'neokex-ica';

const bot = new InstagramChatAPI();
await bot.loadCookiesFromFile('./cookies.txt');

const keywords = {
  'hello': 'Hi there! How can I help you?',
  'help': 'Available commands: hello, help, info',
  'info': 'This is an automated Instagram bot!'
};

bot.on('message', async (message) => {
  const { threadId, text, userId } = message;
  
  if (userId === bot.getCurrentUserID()) return;
  
  const lowerText = text.toLowerCase();
  
  for (const [keyword, response] of Object.entries(keywords)) {
    if (lowerText.includes(keyword)) {
      await bot.dm.sendMessage(threadId, response);
      break;
    }
  }
});

bot.dm.startPolling(5000);
```

### Bulk Message Sender

```javascript
import InstagramChatAPI from 'neokex-ica';

const bot = new InstagramChatAPI();
await bot.loadCookiesFromFile('./cookies.txt');

const recipients = ['user_id_1', 'user_id_2', 'user_id_3'];
const message = 'Hey! Check out our new product!';

for (const userId of recipients) {
  try {
    await bot.dm.sendMessageToUser(userId, message);
    console.log(`✅ Sent to ${userId}`);
    
    // Wait 3 seconds between messages to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 3000));
  } catch (error) {
    console.error(`❌ Failed for ${userId}:`, error.message);
  }
}

console.log('Bulk sending complete!');
```

### Inbox Monitor

```javascript
import InstagramChatAPI from 'neokex-ica';

const bot = new InstagramChatAPI();
await bot.loadCookiesFromFile('./cookies.txt');

async function checkInbox() {
  const inbox = await bot.getInbox();
  
  console.log(`\n📬 Inbox Summary:`);
  console.log(`Total conversations: ${inbox.threads.length}`);
  console.log(`Unseen messages: ${inbox.unseen_count}\n`);
  
  inbox.threads.slice(0, 5).forEach((thread, i) => {
    const username = thread.users?.[0]?.username || 'Unknown';
    const lastMsg = thread.last_permanent_item?.text || '(media)';
    console.log(`${i + 1}. @${username}`);
    console.log(`   "${lastMsg.substring(0, 50)}..."\n`);
  });
}

// Check inbox every minute
setInterval(checkInbox, 60000);
checkInbox(); // Initial check
```

### Photo Sharing Bot

```javascript
import InstagramChatAPI from 'neokex-ica';

const bot = new InstagramChatAPI();
await bot.loadCookiesFromFile('./cookies.txt');

bot.on('message', async (message) => {
  const { threadId, text, userId } = message;
  
  if (userId === bot.getCurrentUserID()) return;
  
  if (text.toLowerCase().includes('send photo')) {
    // Send a random photo from URL
    const photoUrl = 'https://picsum.photos/800/600';
    await bot.dm.sendPhotoFromUrl(threadId, photoUrl);
    await bot.dm.sendMessage(threadId, 'Here\'s a random photo for you!');
  }
});

bot.dm.startPolling(5000);
```

---

## Advanced Examples

### Rate Limiting Handler

```javascript
async function sendWithRetry(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error.message.includes('429') || error.message.includes('rate')) {
        const delay = Math.pow(2, i) * 1000; // Exponential backoff
        console.log(`Rate limited, waiting ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
  throw new Error('Max retries exceeded');
}

// Usage
await sendWithRetry(() => 
  bot.dm.sendMessage('thread_id', 'Hello!')
);
```

### Multi-User Message Reactions

```javascript
import InstagramChatAPI from 'neokex-ica';

const bot = new InstagramChatAPI();
await bot.loadCookiesFromFile('./cookies.txt');

bot.on('message', async (message) => {
  const { threadId, itemId, text, userId } = message;
  
  if (userId === bot.getCurrentUserID()) return;
  
  // React to messages containing keywords
  if (text.includes('love')) {
    await bot.dm.sendReaction(threadId, itemId, '❤️');
  } else if (text.includes('funny') || text.includes('lol')) {
    await bot.dm.sendReaction(threadId, itemId, '😂');
  } else if (text.includes('thanks')) {
    await bot.dm.sendReaction(threadId, itemId, '🙏');
  }
});

bot.dm.startPolling(5000);
```

---

## Tips & Best Practices

### 1. Rate Limiting
Always add delays between requests:
```javascript
await new Promise(resolve => setTimeout(resolve, 3000)); // 3 seconds
```

### 2. Error Handling
Wrap all API calls in try-catch:
```javascript
try {
  await bot.dm.sendMessage(threadId, text);
} catch (error) {
  console.error('Error:', error.message);
}
```

### 3. Cookie Authentication
Use cookies instead of username/password for better reliability:
```javascript
await bot.loadCookiesFromFile('./cookies.txt');
```

### 4. Environment Variables
Store sensitive data in environment variables:
```javascript
import dotenv from 'dotenv';
dotenv.config();

const username = process.env.IG_USERNAME;
const password = process.env.IG_PASSWORD;
```

### 5. Logging
Add logging for debugging:
```javascript
console.log(`Sending message to ${userId}...`);
await bot.dm.sendMessageToUser(userId, text);
console.log('✅ Message sent!');
```

---

## Need Help?

- [GitHub Issues](https://github.com/NeoKEX/neokex-ica/issues)
- [npm Package](https://www.npmjs.com/package/neokex-ica)
- [Main README](./README.md)
