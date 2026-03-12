# ica-neokex

## Overview

`ica-neokex` is a professional Node.js library for Instagram automation and messaging. It provides a comprehensive API wrapper around Instagram's private APIs, enabling developers to build bots, chatbots, and automation tools with 140+ methods for messaging, media sharing, thread management, and social features.

**Core Purpose**: Simplify Instagram automation with a clean, event-driven interface for direct messaging, content posting, user interactions, and long-running bot operation.

**Key Capabilities**:
- 140+ API methods covering messaging, media, threads, feeds, social, and profile management
- Real-time message listening with adaptive polling
- Circuit breaker with auto-recovery for long-running bots
- Cookie-based authentication for persistent sessions
- Graceful shutdown and session expiry detection
- Full observability via `getStatus()` and `getPollingStats()`
- TypeScript support via `allowJs: true` + JSDoc — users get IntelliSense and `.d.ts` declarations without any `.ts` source files

## Version History

- **v1.1.0** — TypeScript support (JSDoc + `allowJs`). Added: `startPolling`/`stopPolling` canonical aliases, `getPendingInbox`, `searchAll`, `getSuggestedUsers`, `getLikedPosts`, `deleteStory`, `reactToStory`, `getCloseFriendsStories`, `getUserHighlights`, `getHighlightItems`, `markNotificationsSeen`, `getFollowRequests`, `approveFollowRequest`, `rejectFollowRequest`. All TS module compilation errors fixed.
- **v1.0.0** — Public release under `ica-neokex`. Includes all v2.2.0 resilience features: circuit breaker, adaptive polling, per-request timeouts, exponential-backoff retry, SIGTERM/SIGINT graceful shutdown, session expiry detection, LRU seenMessageIds eviction, reply handler sweep, cancelable `scheduleMessage()`, `validateSession()`, `pingSession()`, `restartPolling()`, `getStatus()`, error classification, and `do-while` pagination fix for `getFollowers`/`getFollowing`.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Module Structure

**JavaScript source (primary — compiled via `tsc --allowJs`)**

1. **InstagramClientV2** (`src/InstagramClientV2.js`) — Core client with all Instagram API methods
   - Authentication via username/password or cookies
   - All user, feed, post, story, highlights, notifications, search, profile methods
   - Extends EventEmitter3

2. **DirectMessageV2** (`src/DirectMessageV2.js`) — Messaging and polling layer
   - All DM operations: send, receive, reactions, media uploads
   - Adaptive polling loop with circuit breaker
   - Per-request HTTP timeout (`withTimeout`)
   - `withRetry` on all send operations
   - LRU seenMessageIds eviction (cap 5k)
   - Periodic reply-handler sweep
   - SIGTERM/SIGINT graceful shutdown
   - `getPollingStats()` and `restartPolling()`

3. **CookieManager** (`src/CookieManager.js`) — Cookie persistence

4. **InstagramChatAPI** (`src/index.js`) — Main API facade
   - Entry point combining client and DM functionality
   - 140+ public methods with clean delegation
   - Comprehensive JSDoc annotations for full TypeScript IntelliSense
   - Both default and named `{ InstagramChatAPI }` exports

5. **Supporting Utilities**:
   - **Logger** (`src/Logger.js`) — Colored console logging
   - **Banner** (`src/Banner.js`) — CLI branding display
   - **Utils** (`src/utils.js`) — `withRetry`, `withTimeout`, `exponentialBackoff`, `classifyError`, `formatUptime`, `sleep`

**Auxiliary JS modules (compiled alongside primary JS, not imported by main files)**

Located in `src/api/`, `src/core/`, `src/polling/`, `src/types/`:
- `src/core/client.js`, `src/core/cookies.js`
- `src/polling/engine.js`
- `src/api/` — feeds, media, messaging, posts, profile, search, stories, threads, users, index
- `src/types/` — events, message, options, thread, user, index

### Build System

- **`tsconfig.json`**: `allowJs: true`, `checkJs: false` — compiles both `.js` and `.ts` from `src/`
- **Output**: `dist/` — mirrors `src/` structure with `.js`, `.d.ts`, `.d.ts.map`, `.js.map` for each file
- **Entry point**: `dist/index.js` (compiled from `src/index.js`)
- **Types**: `dist/index.d.ts` (auto-generated from JSDoc annotations)

### Design Patterns

- **Facade Pattern**: `InstagramChatAPI` delegates to specialized components
- **Event Emitter Pattern**: EventEmitter3 for reactive message and lifecycle events
- **Circuit Breaker Pattern**: Opens after N consecutive errors, auto-recovers after cooldown
- **Adaptive Polling**: Interval adjusts based on activity (speeds up/slows down)

### Authentication Flow

1. **Cookie-based (Recommended)**: Load Netscape cookies → inject into API state → extract user info
2. **Username/Password**: Generate device fingerprint → login → store session

### Error Handling

- `classifyError()` categorizes errors as `auth`, `ratelimit`, `network`, or `unknown`
- `withRetry()` applies per-type backoff: auth = no retry, ratelimit = 10s–120s, network = 2s–30s
- Circuit breaker prevents repeated calls during outage periods
- `uncaughtException` and `unhandledRejection` forwarded to `onError` handlers

## Runtime Requirements

- **Node.js**: >=20.0.0 (required by Sharp v0.34)
- **Platform**: Cross-platform (Windows/macOS/Linux)
- **Native Dependencies**: Sharp requires platform-specific binaries

## External Dependencies

| Package | Version | Purpose |
|---|---|---|
| instagram-private-api | ^1.46.1 | Core Instagram API client |
| axios | ^1.6.2 | HTTP client for media downloads |
| sharp | ^0.34.4 | High-performance image processing |
| form-data | ^4.0.4 | Multipart form construction |
| eventemitter3 | ^5.0.1 | Lightweight event emitter |

## Environment Variables

- `IG_PROXY` (optional): HTTP proxy URL for API requests
