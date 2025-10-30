# Implementation Notes for Instagram Chat API

This document provides detailed guidance for making this Instagram Chat API production-ready.

## ⚠️ Important Disclaimer

This library uses Instagram's **private/unofficial API** which:
- Violates Instagram's Terms of Service
- Can result in account suspension or permanent bans
- Has no official documentation or support
- Changes frequently without notice
- Is designed to prevent automation

**Use at your own risk and only for educational purposes.**

---

## Current Implementation Status

### ✅ Implemented (Production-Ready)
1. **Pre-login Flow**: Fetches initial CSRF tokens and cookies before login
   - Captures mid, www_claim from headers
   - Establishes session before authentication
2. **Professional Headers**: Complete set of Instagram mobile app headers
   - X-IG-Capabilities, X-IG-Connection-Type, X-IG-Connection-Speed
   - X-FB-HTTP-Engine, X-IG-App-ID
   - **X-MID**: Machine identifier from cookies
   - **X-IG-WWW-Claim**: Authorization claim from Instagram
   - **X-Bloks-Version-Id**: Instagram's Bloks framework version
   - **X-Pigeon-Rawclienttime**: Timestamp for request verification
3. **Payload Signing Framework**: HMAC-SHA256 signing utilities integrated
   - `signPayload()` function integrated into login
   - **⚠️ CRITICAL**: Uses placeholder signature key 'SIGNATURE'
   - **To work with real endpoints**: Replace `this.SIGNATURE_KEY` with actual Instagram signature key
   - Key extraction requires reverse engineering Instagram APK (see below)
4. **Enhanced Login**: Improved login with additional device parameters
   - phone_id, adid, google_tokens
   - jazoest, country_codes
   - _csrftoken, _uuid
5. **Better Error Handling**: Surfaces Instagram's error_type and status fields
   - Invalid credentials (400) with error_type
   - Rate limiting (429) with retry information
   - Two-factor authentication detection with identifier
   - Challenge detection with api_path
   - Session expiration (401) with error_type
6. **Cookie Management**: Proper cookie extraction and persistence
   - Captures and merges cookies from all responses
   - Persists mid for X-MID header
7. **Session State Management**: Complete session saving/loading with all device IDs
   - All device identifiers (deviceId, phoneId, adId, waterfallId)
   - Session tokens (mid, wwwClaim, bloksVersionId)

### ⚠️ Partially Implemented (Framework Ready)
1. **Basic Text Messaging**: Works with current implementation
2. **Thread Management**: Basic operations implemented
3. **Cookie-based Authentication**: Recommended for production use

### ❌ Not Implemented (Requires Advanced Work)
The following features require additional reverse engineering and are beyond the scope of this framework:

1. **⚠️ CRITICAL: Instagram Signature Key**
   - Current: Payload signing is integrated but uses placeholder key 'SIGNATURE'
   - Needed: Real Instagram signature key from the mobile app
   - Location: `src/InstagramClient.js` line 32: `this.SIGNATURE_KEY = 'SIGNATURE';`
   - **Impact**: Login will fail with 400 error on real Instagram endpoints without the real key
   - **Why it's hard**: Instagram's signature key is:
     - Embedded in their mobile app binary (APK)
     - Obfuscated and changes periodically
     - Different across app versions
     - Protected by Instagram's security measures
   - **How to extract**:
     ```bash
     # Download Instagram APK
     # Use jadx or apktool to decompile
     # Search for strings like "IG_SIG_KEY" or signature-related code
     # The key is typically a 64-character hex string
     ```
   - **Workaround**: Use cookie-based authentication instead (recommended)

2. **Media Uploads** (photos, videos, voice notes)
   - Current: Method signatures exist but use placeholder implementations
   - Needed: Instagram's multi-stage upload flow:
     1. Upload to Instagram's upload server
     2. Get upload_id from response
     3. Use upload_id to send message with media
   - **Why it's hard**: Requires chunked upload protocol, specific headers, and upload endpoints that change

3. **Two-Factor Authentication (2FA)**
   - Current: Detects 2FA requirement and throws error
   - Needed: Implement 2FA code submission flow
   - Method needed: `loginWith2FA(username, password, code)`

4. **Challenge Resolution**
   - Current: Detects challenge requirement
   - Needed: Handle Instagram's security challenges (phone verification, photo verification, etc.)

---

## How to Make Production-Ready

### Option 1: Use Cookie-Based Authentication (Recommended)

The **safest and most reliable** way to use this API is with cookie-based authentication:

```javascript
import InstagramChatAPI from 'neokex-ica';

const bot = new InstagramChatAPI();

// Export cookies from your browser using a browser extension
// Chrome: "Get cookies.txt" extension
// Firefox: "cookies.txt" extension
bot.loadCookiesFromFile('./cookies.txt');

// Now you can use all messaging features
await bot.sendMessage(threadId, 'Hello!');
```

**Advantages:**
- No need to reverse engineer login flow
- Bypasses 2FA and challenges
- More reliable than password login
- Can use your existing Instagram session

**Disadvantages:**
- Cookies expire (typically 90 days)
- Requires manual cookie export
- User must login through Instagram app/web first

### Option 2: Implement Full Login Flow (Advanced)

If you absolutely need username/password login for production:

#### Step 1: Reverse Engineer Signature Key

```javascript
// Current placeholder in src/utils.js
export function signPayload(payload, key) {
  const jsonPayload = JSON.stringify(payload);
  const signature = generateSignature(jsonPayload, key);
  return {
    signed_body: `SIGNATURE.${jsonPayload}`,
    ig_sig_key_version: '4'
  };
}

// You need to:
// 1. Download Instagram APK
// 2. Use tools like jadx, apktool to decompile
// 3. Find the signature key (usually a long hex string)
// 4. Update the key in the signPayload function
```

Recommended tools:
- **JADX**: Java decompiler for APK
- **Frida**: Dynamic instrumentation toolkit
- **Charles Proxy** / **Proxyman**: HTTP proxy to analyze traffic
- **mitmproxy**: HTTPS traffic interception

#### Step 2: Implement Signed Requests

```javascript
// Update login method to use signed payloads
import { signPayload } from './utils.js';

const INSTAGRAM_SIG_KEY = 'YOUR_SIGNATURE_KEY_HERE'; // From reverse engineering

async login(username, password) {
  const payload = {
    username: username,
    enc_password: `#PWD_INSTAGRAM_BROWSER:0:${Date.now()}:${password}`,
    device_id: this.deviceId,
    phone_id: this.phoneId,
    // ... other fields
  };

  const signedData = signPayload(payload, INSTAGRAM_SIG_KEY);
  
  const response = await axios.post(
    `${this.baseUrl}/accounts/login/`,
    new URLSearchParams(signedData).toString(),
    { headers: this.getHeaders() }
  );
  // ... handle response
}
```

#### Step 3: Implement 2FA Support

```javascript
async loginWith2FA(username, password, twoFactorCode) {
  // First attempt regular login to get 2FA info
  try {
    await this.login(username, password);
  } catch (error) {
    if (!error.message.includes('Two-factor')) {
      throw error;
    }
  }

  // Submit 2FA code
  const payload = {
    username: username,
    verification_code: twoFactorCode,
    two_factor_identifier: this.twoFactorInfo.two_factor_identifier,
    // ... other fields
  };

  const response = await axios.post(
    `${this.baseUrl}/accounts/two_factor_login/`,
    new URLSearchParams(payload).toString(),
    { headers: this.getHeaders() }
  );
  
  // Process response similar to regular login
}
```

#### Step 4: Implement Media Uploads

```javascript
async uploadPhoto(photoPath) {
  // Step 1: Read photo file
  const photoBuffer = fs.readFileSync(photoPath);
  
  // Step 2: Upload to Instagram's upload endpoint
  const uploadId = Date.now().toString();
  const uploadResponse = await axios.post(
    'https://i.instagram.com/rupload_igphoto/...',
    photoBuffer,
    {
      headers: {
        'X-Entity-Name': `fb_uploader_${uploadId}`,
        'X-Entity-Length': photoBuffer.length.toString(),
        'X-Instagram-Rupload-Params': JSON.stringify({
          upload_id: uploadId,
          media_type: '1',
          // ... other params
        }),
        // ... other headers
      }
    }
  );

  // Step 3: Return upload_id for use in sendPhoto()
  return uploadId;
}

async sendPhoto(threadId, photoPath) {
  const uploadId = await this.uploadPhoto(photoPath);
  
  // Use upload_id instead of direct URL
  const payload = new URLSearchParams({
    recipient_users: '[]',
    action: 'send_item',
    thread_ids: `["${threadId}"]`,
    upload_id: uploadId,
    // ... other fields
  });

  return await this.request(
    '/direct_v2/threads/broadcast/configure_photo/',
    'POST',
    payload.toString()
  );
}
```

---

## Libraries to Study

These open-source projects have working implementations:

1. **Python**: [instagrapi](https://github.com/subzeroid/instagrapi)
   - Most actively maintained (2025)
   - Has working login, 2FA, media uploads
   - Good reference for API endpoints and payloads

2. **Python**: [instagram-private-api](https://github.com/ping/instagram_private_api)
   - Older but well-documented
   - Good for understanding request signing

3. **Node.js**: [instagram-private-api (Node port)](https://github.com/dilame/instagram-private-api)
   - JavaScript implementation
   - Closer to this project's structure

---

## Testing & Development

### 1. Use Instagram Test Accounts
- Create dedicated test accounts (not your personal account)
- Instagram aggressively bans automation accounts
- Use residential proxies if doing extensive testing

### 2. Monitor Traffic
```bash
# Use mitmproxy to see actual Instagram app traffic
mitmproxy -p 8080

# Configure your phone/emulator to use the proxy
# Install mitmproxy CA certificate on device
# Open Instagram app and perform actions
# Study the requests/responses
```

### 3. Rate Limiting Strategy
```javascript
// Implement request throttling
class RateLimiter {
  constructor(maxRequests = 60, perMinutes = 1) {
    this.maxRequests = maxRequests;
    this.perMinutes = perMinutes;
    this.requests = [];
  }

  async waitIfNeeded() {
    const now = Date.now();
    const windowStart = now - (this.perMinutes * 60 * 1000);
    this.requests = this.requests.filter(time => time > windowStart);

    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = this.requests[0];
      const waitTime = oldestRequest + (this.perMinutes * 60 * 1000) - now;
      await sleep(waitTime);
    }

    this.requests.push(now);
  }
}

// Use in requests
const rateLimiter = new RateLimiter(60, 1); // 60 requests per minute
await rateLimiter.waitIfNeeded();
await this.request('/endpoint');
```

---

## Security Best Practices

1. **Never commit credentials**
   ```javascript
   // Use environment variables
   const username = process.env.INSTAGRAM_USERNAME;
   const password = process.env.INSTAGRAM_PASSWORD;
   ```

2. **Encrypt stored sessions**
   ```javascript
   import crypto from 'crypto';

   function encryptSession(sessionData, key) {
     const cipher = crypto.createCipher('aes-256-cbc', key);
     let encrypted = cipher.update(JSON.stringify(sessionData), 'utf8', 'hex');
     encrypted += cipher.final('hex');
     return encrypted;
   }
   ```

3. **Use proxies for production**
   - Rotate IP addresses
   - Use residential proxies (not datacenter)
   - Avoid rate limits and bans

4. **Implement proper logging**
   ```javascript
   // Log requests but never log credentials/tokens
   console.log(`Request to ${endpoint}`); // OK
   console.log(`Token: ${this.token}`);   // NEVER DO THIS
   ```

---

## Common Issues & Solutions

### Issue: "Challenge Required"
**Solution**: The account needs verification through the Instagram app. This happens with:
- New accounts
- Accounts with suspicious activity
- Accounts accessed from new IPs

**Fix**: Login through the official Instagram app once, complete the challenge, then use cookies.

### Issue: "Rate Limited"
**Solution**: Instagram limits requests per hour/day. 
**Fix**: 
- Implement exponential backoff
- Use cookie-based auth (less suspicious)
- Spread requests over time
- Use multiple accounts/proxies

### Issue: "Session Expired"
**Solution**: Cookies/tokens expire after ~90 days.
**Fix**:
- Monitor 401 responses
- Re-login automatically
- Save new cookies after successful login

### Issue: "Login Failed: Bad Request"
**Solution**: Usually means:
- Wrong username/password
- Need to verify through email/SMS
- IP banned/suspicious

**Fix**: Use cookies instead of password login.

---

## Performance Optimization

1. **Reuse Sessions**
   ```javascript
   // Save session after login
   const session = await bot.getSessionState();
   fs.writeFileSync('session.json', JSON.stringify(session));

   // Load session on next run (skip login)
   const session = JSON.parse(fs.readFileSync('session.json'));
   bot.loadSessionState(session);
   ```

2. **Batch Operations**
   ```javascript
   // Instead of sending messages one by one
   for (const thread of threads) {
     await bot.sendMessage(thread.id, 'Hello'); // Slow
   }

   // Use Promise.all for independent operations
   await Promise.all(
     threads.map(thread => bot.sendMessage(thread.id, 'Hello'))
   );
   ```

3. **Cache User Info**
   ```javascript
   const userCache = new Map();

   async function getUserInfoCached(userId) {
     if (!userCache.has(userId)) {
       const info = await bot.getUserInfo(userId);
       userCache.set(userId, info);
     }
     return userCache.get(userId);
   }
   ```

---

## Legal & Ethical Considerations

1. **Terms of Service**: This violates Instagram's ToS
2. **Spam Prevention**: Don't send unsolicited messages
3. **Privacy**: Respect user privacy, don't scrape data
4. **Rate Limits**: Don't abuse Instagram's servers
5. **Account Safety**: Expect account bans

---

## Alternatives to Consider

If you need a production solution without dealing with private API complexities:

1. **Instagram Graph API** (Official)
   - Pros: Legal, supported, documented
   - Cons: Requires business account, limited features, app review process
   - Use case: Public content, business accounts

2. **Third-party Services**
   - [HikerAPI](https://hikerapi.com/): Managed private API access
   - [Late API](https://getlate.dev/): Instagram automation service
   - Pros: They handle the complexity
   - Cons: Monthly costs, usage limits

---

## Conclusion

This library provides a **solid foundation** for Instagram chat automation with:
- ✅ Professional-grade login flow with pre-login and proper headers
- ✅ Comprehensive error handling
- ✅ Cookie-based authentication (production-ready)
- ✅ Session management
- ✅ Complete API structure

For **production use**, we strongly recommend:
1. Use cookie-based authentication
2. Implement proper rate limiting
3. Use proxies and residential IPs
4. Have fallback/backup accounts
5. Monitor for API changes
6. Consider legal implications

For **full feature support** (media uploads, 2FA), you'll need to:
1. Reverse engineer Instagram's mobile app
2. Extract signature keys
3. Study actual API traffic
4. Continuously update as Instagram changes their API

**Remember**: Instagram actively fights automation. This is a cat-and-mouse game with no guarantees.
