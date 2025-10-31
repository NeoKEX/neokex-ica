# Security Notice

## Instagram Signature Key

This library includes a default Instagram signature key extracted from the Instagram mobile app (APK version 222.0.0.13.114). This key is used for HMAC-SHA256 payload signing.

### Important Warnings

1. **Key Rotation**: Instagram changes signature keys periodically when they update their app. The included key may become outdated.

2. **Security Risk**: This key is proprietary to Instagram and using it may violate Instagram's Terms of Service.

3. **Compliance**: Hardcoding this key may present compliance issues for production applications.

### Recommended Approach

**Option 1: Use Environment Variable (Recommended)**
```bash
export INSTAGRAM_SIGNATURE_KEY="your_extracted_key_here"
```

The library will automatically use the environment variable if set:
```javascript
// In InstagramClient.js
this.SIGNATURE_KEY = process.env.INSTAGRAM_SIGNATURE_KEY || '[fallback_key]';
```

**Option 2: Extract Your Own Key**

To extract the latest signature key from Instagram's app:

1. Download Instagram APK from a trusted source
2. Use tools like `jadx` or `apktool` to decompile
3. Search for `SIGNATURE_KEY` or signature-related constants
4. The key is typically a 64-character hexadecimal string

```bash
# Example extraction steps
jadx -d output/ instagram.apk
grep -r "SIGNATURE_KEY" output/
# or
grep -r "sig.*key" output/resources/
```

**Option 3: Use Cookie-Based Authentication**

The most reliable approach is to use cookie-based authentication, which doesn't require payload signing:

```javascript
import InstagramChatAPI from './src/index.js';

const bot = new InstagramChatAPI();
bot.loadCookiesFromFile('./cookies.txt');

// No signature key needed!
await bot.sendMessage(threadId, 'Hello!');
```

### Cookie-Based Auth Advantages

1. ✅ No signature key needed
2. ✅ Bypasses 2FA and challenges  
3. ✅ More reliable than username/password
4. ✅ Less likely to trigger security checks
5. ✅ No compliance issues with hardcoded keys

### How to Export Cookies

**Chrome:**
1. Install "Get cookies.txt" extension
2. Navigate to instagram.com
3. Click extension icon → Export → "Netscape format"
4. Save as `cookies.txt`

**Firefox:**
1. Install "cookies.txt" extension
2. Navigate to instagram.com
3. Click extension icon
4. Save as `cookies.txt`

### Legal Disclaimer

Using this library with the included signature key or extracting your own key from Instagram's app may violate:
- Instagram's Terms of Service
- Reverse engineering prohibitions
- Applicable cybersecurity laws

**Use at your own risk!**

This library is provided for educational purposes only. The authors are not responsible for any consequences of using this library, including but not limited to account bans, legal action, or other damages.

### Reporting Security Issues

If you discover a security vulnerability in this library, please report it responsibly. Do not publish the issue publicly until it has been addressed.

Contact: [Create an issue on GitHub with `[SECURITY]` prefix]

---

**Remember:** The safest way to use this library is with cookie-based authentication, avoiding signature keys entirely.
