# Quick Start Guide: neokex-ica with instagrapi-rest

This guide will get you up and running with full Instagram bot capabilities in 15 minutes.

## Prerequisites

- Node.js 18+ installed
- Docker installed (for instagrapi-rest backend)
- Instagram account

## Step 1: Start instagrapi-rest Backend (5 minutes)

The instagrapi-rest service provides reliable media upload capabilities.

### Using Docker:

```bash
docker run -d -p 8000:8000 instagrapi-rest:latest
```

### Using Docker Compose (Recommended):

```bash
docker-compose up -d
```

### Verify it's running:

```bash
curl http://localhost:8000/docs
# Should open Swagger UI showing available endpoints
```

## Step 2: Install Dependencies (1 minute)

```bash
npm install
```

## Step 3: Choose Authentication Method

### Option A: Cookie-Based (Recommended)

Export your Instagram cookies using a browser extension:
- Chrome: "Get cookies.txt" extension  
- Firefox: "cookies.txt" extension

Save as `cookies.txt` (already in .gitignore).

### Option B: Username/Password

Set environment variables:
```bash
export INSTAGRAM_USERNAME="your_username"
export INSTAGRAM_PASSWORD="your_password"
```

## Step 4: Test the Integration

```bash
node test-instagrapi.js
```

This will:
- Check if instagrapi-rest is running
- Test login
- Get your profile info
- List your inbox
- Verify media upload capabilities

## Step 5: Start Building Your Bot!

### Basic Example (Native Mode - Text Only):

```javascript
import InstagramChatAPI from './src/index.js';

const bot = new InstagramChatAPI();

// Load cookies
bot.loadCookiesFromFile('./cookies.txt');

// Send text message
await bot.sendMessage('thread_id', 'Hello!');

// Get inbox
const inbox = await bot.getInbox();
console.log(`You have ${inbox.threads.length} conversations`);
```

### Full Example (instagrapi Mode - All Features):

```javascript
import InstagramChatAPI from './src/index.js';

const bot = new InstagramChatAPI({
  mode: 'instagrapi',  // Enable full features
  instagrapiUrl: 'http://localhost:8000'
});

// Login
await bot.login('username', 'password');

// Send text message
await bot.sendMessage('user_id', 'Hello!');

// Send photo ✅
await bot.sendPhoto('user_id', './image.jpg', 'Check this out!');

// Send video ✅
await bot.sendVideo('user_id', './video.mp4', 'Cool video!');

// Send voice note ✅
await bot.sendVoiceNote('user_id', './audio.m4a');

// Get inbox
const inbox = await bot.getInbox();
console.log(inbox);
```

## Supported Features

### Native Mode (neokex-ica only):
- ✅ Text messages
- ✅ Get inbox/threads
- ✅ Mark as seen
- ✅ Typing indicators
- ✅ Thread management
- ⚠️ Media uploads (not supported)

### instagrapi Mode (with backend):
- ✅ All native mode features
- ✅ Photo uploads
- ✅ Video uploads
- ✅ Voice notes
- ✅ All media types

## API Reference

### Main Methods

```javascript
// Initialize
const bot = new InstagramChatAPI({ 
  mode: 'native' | 'instagrapi',
  instagrapiUrl: 'http://localhost:8000'
});

// Authentication
await bot.login(username, password);
bot.loadCookiesFromFile('./cookies.txt');
bot.saveCookiesToFile('./cookies.txt');

// Messaging
await bot.sendMessage(threadId, text);
await bot.sendMessageToUser(userId, text);
await bot.sendPhoto(userIdOrThreadId, photoPath, caption);
await bot.sendVideo(userIdOrThreadId, videoPath, caption);
await bot.sendVoiceNote(userIdOrThreadId, audioPath);

// Inbox
const inbox = await bot.getInbox();
const thread = await bot.getThread(threadId);
await bot.markAsSeen(threadId, itemId);

// User Info
const user = await bot.getUserInfo(userId);
const userByName = await bot.getUserInfoByUsername(username);
```

## Troubleshooting

### instagrapi-rest not starting

```bash
# Check if Docker is running
docker ps

# Check logs
docker logs <container_id>

# Restart
docker-compose restart
```

### Login Failed

- Use cookie-based authentication (more reliable)
- Check if account needs verification
- Try logging in through Instagram app first

### Media Upload Failed

- Make sure instagrapi-rest is running
- Check file format (JPG for photos, MP4 for videos)
- Verify file size (Instagram has limits)

## Security Notes

- Never commit `cookies.txt` or `session.json` (already in .gitignore)
- Use environment variables for credentials
- This is an unofficial API - use at your own risk
- Instagram may ban accounts using automation

## Next Steps

- Read `RELIABLE_LIBRARIES_COMPARISON.md` for detailed architecture info
- Check `examples/` folder for more examples
- Review `IMPLEMENTATION_NOTES.md` for production considerations

## Support

This library uses Instagram's private API which:
- Violates Instagram's Terms of Service
- Can result in account suspension
- Has no official support
- Changes without notice

**Use responsibly and at your own risk!**
