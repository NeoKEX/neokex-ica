# Instagram Chat API

## Overview
**neokex-ica** is a pure API library package for Instagram chat/DM functionality. This package is designed to be imported and used by developers building Instagram bots - it provides only the API layer without any bot implementation.

**Purpose**: A reusable library that other developers can install via npm/GitHub and use in their own Instagram bot projects.

**⚠️ DISCLAIMER**: This is an unofficial API that uses reverse-engineered Instagram endpoints. Using this may violate Instagram's Terms of Service and could result in account restrictions or bans. Use at your own risk.

## Recent Changes
- **October 30, 2025**: Initial project setup
  - Created core Instagram API client with class architecture
  - Implemented foundational login and session management
  - Added direct messaging functionality framework
  - Created event-based message listening system
  - Added Netscape cookie format support for authentication
  - Removed client-side rate limiting restrictions
  - Added detailed documentation and implementation notes
  - **Converted to pure API library** (removed example bots - this is library-only for use in other projects)
  - **Note**: This is an architectural framework. Instagram's private API requires advanced implementation (payload signing, HMAC, pre-login flows) not included in this base version. See IMPLEMENTATION_NOTES.md for details.

## Project Architecture

### Structure
```
neokex-ica/
├── src/
│   ├── index.js           # Main export file
│   ├── InstagramClient.js # Core client with login/session
│   ├── DirectMessage.js   # DM functionality
│   ├── CookieManager.js   # Cookie handling (Netscape format)
│   └── utils.js           # Helper utilities
├── README.md              # Complete API documentation
├── IMPLEMENTATION_NOTES.md # Advanced implementation guide
└── package.json
```

### Key Components
1. **InstagramClient**: Handles authentication, session management, and API requests
2. **DirectMessage**: Manages sending/receiving messages and thread operations
3. **CookieManager**: Handles Netscape format cookie loading/saving
4. **Event System**: EventEmitter-based system for real-time message handling

### Dependencies
- `axios`: HTTP client for API requests
- `eventemitter3`: Event handling for message listeners

## User Preferences
- **Pure API library package** (no bot implementation included)
- Designed for GitHub distribution - others will import this package
- Focus on chat/DM functionality for Instagram bots
- Node.js implementation
- Support for Netscape cookie format
- No client-side rate limiting

## Usage
This is a library package designed to be installed and imported by other projects:

```javascript
import InstagramChatAPI from 'neokex-ica';
const bot = new InstagramChatAPI();
bot.loadCookiesFromFile('./cookies.txt');
// ... use the API in your own bot
```

See README.md for complete API documentation.
