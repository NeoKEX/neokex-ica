# Instagram Chat API

## Overview
An unofficial Instagram chat API package that enables developers to build Instagram bots with direct messaging capabilities. This package provides a reusable library for interacting with Instagram's private API.

**⚠️ DISCLAIMER**: This is an unofficial API that uses reverse-engineered Instagram endpoints. Using this may violate Instagram's Terms of Service and could result in account restrictions or bans. Use at your own risk.

## Recent Changes
- **October 30, 2025**: Initial project setup
  - Created core Instagram API client with class architecture
  - Implemented foundational login and session management
  - Added direct messaging functionality framework
  - Created event-based message listening system
  - Built comprehensive example bot for demonstration
  - Added detailed documentation and implementation notes
  - **Note**: This is an architectural framework. Instagram's private API requires advanced implementation (payload signing, HMAC, pre-login flows) not included in this base version. See IMPLEMENTATION_NOTES.md for details.

## Project Architecture

### Structure
```
instagram-chat-api/
├── src/
│   ├── index.js           # Main export file
│   ├── InstagramClient.js # Core client with login/session
│   ├── DirectMessage.js   # DM functionality
│   └── utils.js           # Helper utilities
├── example/
│   └── bot.js             # Example bot implementation
└── package.json
```

### Key Components
1. **InstagramClient**: Handles authentication, session management, and API requests
2. **DirectMessage**: Manages sending/receiving messages and thread operations
3. **Event System**: EventEmitter-based system for real-time message handling
4. **Example Bot**: Demonstrates package usage with auto-reply functionality

### Dependencies
- `axios`: HTTP client for API requests
- `eventemitter3`: Event handling for message listeners

## User Preferences
- Building a reusable package/library (not a standalone app)
- Focus on chat/DM functionality for Instagram bots
- Node.js implementation

## Usage
See `example/bot.js` for a complete example of how to use this package to build an Instagram bot.
