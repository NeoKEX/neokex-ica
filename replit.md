# Instagram Chat API

## Overview
**neokex-ica** is a pure API library package for Instagram chat/DM functionality. This is a professional-grade library designed for npm distribution - providing only the API layer without any bot implementation.

**Purpose**: A reusable npm package that developers can install and import into their own projects to build Instagram automation tools and bots. This library provides the foundation; developers build their own applications on top of it.

**⚠️ DISCLAIMER**: This is an unofficial API that uses reverse-engineered Instagram endpoints. Using this may violate Instagram's Terms of Service and could result in account restrictions or bans. Use at your own risk.

## Recent Changes
- **October 31, 2025**: 🚀 **MAJOR UPDATE** - Powered by instagram-private-api Backend
  - ✅ **Complete rewrite using instagram-private-api** as the core backend
  - ✅ **60 API methods** (increased from 44!) - As powerful as instagram-private-api
  - ✅ **Zero Instagram API restrictions** - Inbox access works perfectly (no error 4415001)
  - ✅ **Battle-tested reliability** - Using proven instagram-private-api library (6.3k stars)
  - ✅ **New powerful features**:
    - 📸 Upload photos to feed
    - 🎥 Upload videos to feed  
    - 📖 Upload stories
    - ❤️ Like/Unlike posts
    - 💬 Comment on posts
    - 👥 Follow/Unfollow users
    - 📊 Get followers & following lists
    - 🔍 Search users
    - 📱 Timeline feed
    - 👤 User feed
    - 🗑️ Delete posts
    - ℹ️ Get media info
  - ✅ **All original features preserved**: Direct messaging, reactions, typing indicators, thread management
  - ✅ **Professional logging system** with colored output and timestamps
  - ✅ **Cookie authentication** working perfectly with instagram-private-api
  - ✅ **Backward compatible** - Same clean API interface
  - ✅ **Direct access** to instagram-private-api client via `getIgClient()` for advanced users

## Project Architecture

### Structure
```
neokex-ica/
├── src/
│   ├── index.js              # Main API export (60 methods)
│   ├── InstagramClientV2.js  # instagram-private-api wrapper with auth
│   ├── DirectMessageV2.js    # DM functionality using instagram-private-api
│   ├── CookieManager.js      # Cookie handling (Netscape format)
│   ├── Logger.js             # Professional logging utility with colors
│   ├── Banner.js             # ASCII art banner utility
│   └── utils.js              # Helper utilities
├── README.md                 # Complete API documentation (for npm)
├── LICENSE                   # MIT License
├── package.json              # npm package config (v2.0.0)
├── verify.js                 # Package verification script
└── test-comprehensive.js     # Comprehensive feature testing
```

### Key Components
1. **InstagramClientV2**: Wraps instagram-private-api with cookie support and all powerful features
2. **DirectMessageV2**: Complete DM functionality using instagram-private-api backend
3. **CookieManager**: Handles Netscape format cookie loading/saving
4. **Logger**: Professional colored logging system with timestamps
5. **Banner**: ASCII art banner display for professional appearance
6. **Event System**: EventEmitter-based system for real-time message handling

### Dependencies
- `instagram-private-api`: Battle-tested Instagram private API (6.3k ⭐)
- `eventemitter3`: Event handling for message listeners
- `axios`: HTTP client (used by instagram-private-api)
- `form-data`: Form data handling

## Vision & Philosophy

### Core Principles
- **Pure Library** - Only API functionality, zero bot implementation
- **npm-First** - Professional package designed specifically for npm distribution
- **Developer Tool** - Developers import this and build their own applications
- **Professional Grade** - Production-ready with proper logging, error handling, and documentation
- **Zero Opinions** - Library doesn't dictate how developers use it

### Technical Standards
- **Battle-tested backend** - Powered by instagram-private-api (6.3k GitHub stars)
- **Professional presentation** - Colored logging with timestamps and ASCII banner
- **60 powerful methods** - Complete Instagram automation capabilities
- **Event-driven architecture** - Clean, reactive programming model
- **Node.js ES6 modules** - Modern JavaScript standards
- **Netscape cookie format** - Industry-standard authentication
- **ZERO client-side rate limiting** - No artificial throttling (developers control their own rates)
- **Complete documentation** - README.md for npm, comprehensive test coverage

## API Features (60 Methods Total)
### Direct Messaging (23 methods)
- **Messaging**: text, photo, video, voice, link, reactions, unsend
- **Threads**: mute, unmute, archive, unarchive, delete, leave, add/remove users, update title
- **Management**: inbox, pending requests, approve threads, mark as seen, typing indicators
- **Events**: onMessage, onTyping, onError, onLogin, onRateLimit, onPendingRequest
- **Real-time**: Polling-based message listening with event system

### Feed & Posts (13 methods)
- **Upload**: photos, videos, stories
- **Interactions**: like, unlike, comment
- **Browsing**: timeline feed, user feed, media info
- **Management**: delete posts

### Social (11 methods)
- **Users**: getUserInfo, getUserInfoByUsername, search
- **Relationships**: follow, unfollow, getFollowers, getFollowing
- **Identity**: getCurrentUserID, getCurrentUsername

### Advanced (13 methods)
- **Authentication**: login, loadCookiesFromFile, saveCookiesToFile, setCookies, getCookies
- **Session**: getSessionState, loadSessionState
- **Direct Access**: getIgClient() - access underlying instagram-private-api client
- **Polling**: startListening, stopListening, getRecentMessages

## npm Publishing Status
- ✅ Package structure properly configured
- ✅ package.json configured with all metadata
- ✅ Powered by instagram-private-api (battle-tested, 6.3k stars)
- ✅ Professional README.md for npm page
- ✅ MIT License included
- ✅ All dependencies specified
- ✅ ES6 module exports configured
- ✅ Comprehensive test suite included
- 🚀 **Ready for: `npm publish`**

## Power & Reliability
- **60 API methods** - Complete Instagram automation
- **Battle-tested** - Built on instagram-private-api (6.3k stars, used by thousands)
- **Zero API restrictions** - Bypasses Instagram limitations
- **Production-ready** - Professional logging, error handling, graceful fallbacks
- **Clean API** - Same simple interface, maximum power underneath

## Library Usage (by developers who install this)
```javascript
import InstagramChatAPI from 'neokex-ica';

const api = new InstagramChatAPI();

// Load cookies for authentication
await api.loadCookiesFromFile('./cookies.txt');

// Send messages
await api.sendMessage(threadId, 'Hello!');
await api.sendPhoto(threadId, './photo.jpg');
await api.sendVideo(threadId, './video.mp4');

// Upload to feed
await api.uploadPhoto('./image.jpg', 'Check this out!');
await api.uploadStory('./story.jpg');

// Social interactions
await api.likePost(mediaId);
await api.commentPost(mediaId, 'Nice!');
await api.followUser(userId);

// Get data
const inbox = await api.getInbox();
const timeline = await api.getTimelineFeed();
const followers = await api.getFollowers(userId);

// Listen for messages
api.onMessage((msg) => {
  console.log('New message:', msg.text);
});
await api.startListening();

// Advanced: Direct access to instagram-private-api
const ig = api.getIgClient();
// Use full instagram-private-api features if needed
```

See README.md for complete API documentation with all 60 methods.
