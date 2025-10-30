# Instagram Chat API

## Overview
**neokex-ica** is a pure API library package for Instagram chat/DM functionality. This package is designed to be imported and used by developers building Instagram bots - it provides only the API layer without any bot implementation.

**Purpose**: A reusable library that other developers can install via npm/GitHub and use in their own Instagram bot projects.

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
├── README.md              # Complete API documentation
├── IMPLEMENTATION_NOTES.md # Advanced implementation guide
├── RATE_LIMITING.md       # Zero rate limiting policy
├── PUBLISHING.md          # npm publishing guide
├── LICENSE                # MIT License
├── .npmignore             # npm package exclusions
├── package.json           # npm package config (v1.0.0)
├── verify.js              # Package verification script
└── example.js             # Usage example with logging demo
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

## User Preferences
- **Pure API library package** (no bot implementation included)
- **Designed for npm/GitHub distribution** - professional package ready to publish
- **Professional presentation** - colored logging with timestamps and ASCII banner (44 methods)
- Focus on chat/DM functionality for Instagram bots
- Node.js implementation (ES6 modules)
- Support for Netscape cookie format
- **ZERO client-side rate limiting** (core requirement - confirmed implemented)
- **Professional presentation** - colored logs and beautiful banner display

## API Features (44 Methods Total)
- **Authentication**: login, cookie management, session state
- **Messaging**: text, photo, video, voice, sticker, link, reactions, unsend
- **Threads**: mute, unmute, archive, unarchive, delete, leave, add/remove users, update title
- **Users**: getUserInfo, getCurrentUserID, getCurrentUsername, search
- **Events**: onMessage, onTyping, onError, onLogin, onRateLimit, onPendingRequest
- **Real-time**: Polling-based message listening with typing detection

## Usage
This is a library package designed to be installed and imported by other projects:

```javascript
import InstagramChatAPI from 'neokex-ica';
const bot = new InstagramChatAPI();
bot.loadCookiesFromFile('./cookies.txt');
// ... use the API in your own bot
```

See README.md for complete API documentation.
