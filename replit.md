# neokex-ica

## Overview

neokex-ica is a professional Node.js library for Instagram automation and messaging. It provides a comprehensive API wrapper around Instagram's private APIs, enabling developers to build bots, chatbots, and automation tools with 60+ methods for messaging, media sharing, thread management, and social features.

**Core Purpose**: Simplify Instagram automation by providing a clean, event-driven interface for direct messaging, content posting, and user interactions.

**Key Capabilities**:
- Direct messaging and group chat management
- Media uploads (photos, videos, stories)
- Real-time message listening with event-driven architecture
- User operations (follow, unfollow, search)
- Social features (like, comment, feed access)
- Cookie-based authentication for persistent sessions

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Module Structure

The application follows a modular architecture with clear separation of concerns:

1. **InstagramClientV2** (`InstagramClientV2.js`) - Core authentication and session management
   - Wraps the `instagram-private-api` library
   - Handles login via username/password or cookie-based authentication
   - Manages device generation and proxy configuration
   - Extends EventEmitter for event-driven architecture

2. **DirectMessageV2** (`DirectMessageV2.js`) - Messaging operations layer
   - Handles all DM-related functionality (send, receive, reactions)
   - Implements polling mechanism for real-time message listening
   - Manages inbox retrieval and thread operations
   - Processes media uploads with Sharp image processing

3. **CookieManager** (`CookieManager.js`) - Cookie persistence layer
   - Parses Netscape-format cookie files
   - Handles cookie serialization/deserialization
   - Enables session restoration without repeated logins

4. **InstagramChatAPI** (`index.js`) - Main API facade
   - Entry point that combines client and DM functionality
   - Provides simplified, high-level methods
   - Manages banner display on initialization

5. **Supporting Utilities**:
   - **Logger** (`Logger.js`) - Colored console logging with timestamps
   - **Banner** (`Banner.js`) - CLI branding display
   - **Utils** (`utils.js`) - Helper functions (UUID generation, signatures, sleep)

### Design Patterns

**Facade Pattern**: The `InstagramChatAPI` class provides a simplified interface that delegates to specialized components (client, DM manager).

**Event Emitter Pattern**: Extends EventEmitter3 for reactive message handling and lifecycle events (login, new messages).

**Polling Strategy**: Real-time message listening implemented via configurable interval polling rather than WebSocket connections (Instagram API limitation).

**Dependency Injection**: Components receive dependencies through constructor injection (e.g., DirectMessageV2 receives client instance).

### Authentication Flow

1. **Cookie-based (Recommended)**:
   - Load Netscape-format cookies from file
   - Deserialize and inject into instagram-private-api state
   - Extract user info from cookie session
   - Skip password authentication entirely

2. **Username/Password**:
   - Generate device fingerprint
   - Call instagram-private-api login
   - Store session credentials
   - Emit login event with user details

**Rationale**: Cookie-based auth reduces rate limiting risks and avoids triggering Instagram's security challenges.

### Media Processing Pipeline

1. **Input**: File path or URL
2. **Download** (if URL): Fetch using axios
3. **Processing**: Sharp library converts/resizes images
4. **Upload**: instagram-private-api handles multipart upload
5. **Cleanup**: Temporary files deleted

**Technology Choice**: Sharp chosen for high-performance image processing with minimal dependencies.

### Error Handling Strategy

- Comprehensive try-catch blocks in all async operations
- Graceful degradation (e.g., returns empty inbox if endpoint fails)
- Colored logger output for visibility
- Error details exposed through Error objects with context

### Message Polling Architecture

**Problem**: Instagram doesn't provide WebSocket/real-time APIs  
**Solution**: Configurable interval-based polling of inbox feed  
**Implementation**:
- Tracks last sequence ID to detect new messages
- Compares current inbox state with previous snapshot
- Emits events only for genuinely new messages
- Configurable interval (default 5000ms)

**Trade-offs**:
- ✅ Simple, reliable implementation
- ✅ Works with Instagram's request/response API
- ❌ Not truly real-time (polling delay)
- ❌ Increased API request volume

## External Dependencies

### Core NPM Packages

1. **instagram-private-api** (v1.46.1)
   - Purpose: Instagram private API client
   - Usage: All Instagram API interactions (login, messaging, feeds)
   - Critical dependency - entire library wraps this

2. **axios** (v1.6.2)
   - Purpose: HTTP client for media downloads
   - Usage: Fetching images from URLs before upload

3. **sharp** (v0.34.4)
   - Purpose: High-performance image processing
   - Usage: Converting, resizing, and optimizing images before upload
   - Native dependency with platform-specific binaries

4. **form-data** (v4.0.4)
   - Purpose: Multipart form construction
   - Usage: Media upload payloads

5. **eventemitter3** (v5.0.1)
   - Purpose: Lightweight event emitter implementation
   - Usage: Event-driven architecture for message handling

### Instagram API Integration

- **Type**: Private/undocumented REST API
- **Base URL**: `https://i.instagram.com/api/v1/`
- **Authentication**: Session cookies + device fingerprints
- **Key Endpoints Used**:
  - `/direct_v2/inbox/` - Thread listing
  - `/direct_v2/threads/{id}/items/` - Message retrieval
  - `/direct_v2/threads/broadcast/text/` - Send messages
  - `/media/configure/` - Media uploads
  - `/friendships/` - Follow operations
  - `/users/` - User information

**Important**: No official API - relies on reverse-engineered endpoints that may change without notice.

### File System Operations

- Cookie file I/O (Netscape format)
- Temporary image file handling during media processing
- No persistent database - stateless operation

### Runtime Requirements

- **Node.js**: >=16.0.0 (ES modules support)
- **Platform**: Cross-platform (Windows/macOS/Linux)
- **Native Dependencies**: Sharp requires platform-specific binaries

### Environment Variables

- `IG_PROXY` (optional): HTTP proxy URL for API requests
- No other configuration required - library is self-contained