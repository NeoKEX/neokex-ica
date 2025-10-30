# Instagram Chat API

## Overview
**neokex-ica** is a pure API library package for Instagram chat/DM functionality. This is a professional-grade library designed for npm distribution - providing only the API layer without any bot implementation.

**Purpose**: A reusable npm package that developers can install and import into their own projects to build Instagram automation tools and bots. This library provides the foundation; developers build their own applications on top of it.

**⚠️ DISCLAIMER**: This is an unofficial API that uses reverse-engineered Instagram endpoints. Using this may violate Instagram's Terms of Service and could result in account restrictions or bans. Use at your own risk.

## Recent Changes
- **October 30, 2025**: Production-grade Instagram Chat API v1.1.0 + Professional Logging System
  - ✅ **Professional logging system** (colored logs with timestamps and multiple log levels)
  - ✅ **Beautiful ASCII art banner** displayed on initialization
  - ✅ **Colored terminal output** (INFO, SUCCESS, WARN, ERROR, DEBUG, EVENT, etc.)
  - ✅ **Timestamped logs** with [HH:MM:SS] format
  - ✅ **Professional-grade login flow** with pre-login and comprehensive headers
  - ✅ **Advanced error handling** (401, 429, 2FA detection, challenge detection)
  - ✅ **Complete Instagram mobile app headers** (X-IG-Capabilities, X-IG-Connection-Type, etc.)
  - ✅ **Payload signing utilities** (HMAC-SHA256 framework ready)
  - ✅ **Enhanced session management** (all device IDs: phoneId, adId, waterfallId)
  - ✅ **Improved cookie management** with proper extraction and merging
  - ✅ Created comprehensive IMPLEMENTATION_NOTES.md with production guidance
  - ✅ Comprehensive API with 44 methods for full Instagram automation
  - ✅ Implemented multiple message types (text, photo, video, voice, sticker)
  - ✅ Added typing indicators (send & detect)
  - ✅ Added reactions, unsend, thread management (mute, archive, delete, etc.)
  - ✅ Added user info methods and session state management
  - ✅ Netscape cookie format support with CRLF handling
  - ✅ **ZERO client-side rate limiting** (confirmed - no request throttling)
  - ✅ Professional npm package configuration (package.json, LICENSE, .npmignore)
  - ✅ **Package ready for npm publishing**
  - **Note**: Cookie-based authentication is recommended for production. Username/password login works but signature key extraction from Instagram APK is needed for full reliability. See IMPLEMENTATION_NOTES.md for details.

## Project Architecture

### Structure
```
neokex-ica/
├── src/
│   ├── index.js           # Main API export (44 methods)
│   ├── InstagramClient.js # Core client with login/session
│   ├── DirectMessage.js   # DM functionality & polling
│   ├── CookieManager.js   # Cookie handling (Netscape format)
│   ├── Logger.js          # Professional logging utility with colors
│   ├── Banner.js          # ASCII art banner utility
│   └── utils.js           # Helper utilities
├── README.md              # Complete API documentation (for npm)
├── IMPLEMENTATION_NOTES.md # Advanced implementation guide
├── RATE_LIMITING.md       # Zero rate limiting policy
├── PUBLISHING.md          # npm publishing guide
├── LICENSE                # MIT License
├── .npmignore             # npm package exclusions
├── package.json           # npm package config (v1.1.0)
└── verify.js              # Package verification script
```

### Key Components
1. **InstagramClient**: Handles authentication, session management, and API requests
2. **DirectMessage**: Manages sending/receiving messages and thread operations
3. **CookieManager**: Handles Netscape format cookie loading/saving
4. **Logger**: Professional colored logging system with timestamps
5. **Banner**: ASCII art banner display for professional appearance
6. **Event System**: EventEmitter-based system for real-time message handling

### Dependencies
- `axios`: HTTP client for API requests
- `eventemitter3`: Event handling for message listeners

## Vision & Philosophy

### Core Principles
- **Pure Library** - Only API functionality, zero bot implementation
- **npm-First** - Professional package designed specifically for npm distribution
- **Developer Tool** - Developers import this and build their own applications
- **Professional Grade** - Production-ready with proper logging, error handling, and documentation
- **Zero Opinions** - Library doesn't dictate how developers use it

### Technical Standards
- **Professional presentation** - Colored logging with timestamps and ASCII banner
- **44 methods** - Comprehensive API coverage for Instagram automation
- **Event-driven architecture** - Clean, reactive programming model
- **Node.js ES6 modules** - Modern JavaScript standards
- **Netscape cookie format** - Industry-standard authentication
- **ZERO client-side rate limiting** - No artificial throttling (developers control their own rates)
- **Complete documentation** - README.md for npm, implementation guides for advanced usage

## API Features (44 Methods Total)
- **Authentication**: login, cookie management, session state
- **Messaging**: text, photo, video, voice, sticker, link, reactions, unsend
- **Threads**: mute, unmute, archive, unarchive, delete, leave, add/remove users, update title
- **Users**: getUserInfo, getCurrentUserID, getCurrentUsername, search
- **Events**: onMessage, onTyping, onError, onLogin, onRateLimit, onPendingRequest
- **Real-time**: Polling-based message listening with typing detection

## npm Publishing Status
- ✅ Package structure properly configured
- ✅ package.json configured with all metadata
- ✅ .npmignore excludes development files
- ✅ Professional README.md for npm page
- ✅ MIT License included
- ✅ All dependencies specified
- ✅ ES6 module exports configured
- 🚀 **Ready for: `npm publish`**

## Library Usage (by developers who install this)
```javascript
import InstagramChatAPI from 'neokex-ica';

const api = new InstagramChatAPI();
await api.loadCookiesFromFile('./cookies.txt');

api.onMessage((msg) => {
  // Developer builds their own logic here
});

await api.startListening();
```

See README.md for complete API documentation.
