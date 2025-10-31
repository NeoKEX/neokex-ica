# Integration Guide: Extracted Features from Third-Party Libraries

This guide shows how to integrate key features from third-party Instagram libraries into your `neokex-ica` library.

## 🔑 1. Real Instagram Signature Key

### What We Found
```javascript
// From: node_modules/instagram-private-api/dist/core/constants.js
SIGNATURE_KEY = '9193488027538fd3450b83b7d05286d4ca9599a0f7eeed90d8c85925698a05dc';
BREADCRUMB_KEY = 'iN4$aGr0m';
SIGNATURE_VERSION = '4';
APP_VERSION = '222.0.0.13.114';
APP_VERSION_CODE = '350696709';
```

### How to Integrate
**File: `src/InstagramClient.js`**

Replace line 32:
```javascript
// OLD
this.SIGNATURE_KEY = 'SIGNATURE';

// NEW
this.SIGNATURE_KEY = '9193488027538fd3450b83b7d05286d4ca9599a0f7eeed90d8c85925698a05dc';
```

Also update your app version to match Instagram's current version:
```javascript
this.appVersion = '222.0.0.13.114';
this.appVersionCode = '350696709';
```

---

## 📸 2. Photo Upload Implementation

### What We Found
The reference library uploads photos in two steps:
1. Upload the photo file to `/rupload_igphoto/` endpoint
2. Broadcast with `configure_photo` using the returned `upload_id`

### Implementation

**File: `src/InstagramClient.js`** - Add this method:

```javascript
async uploadPhoto(photoBuffer, uploadId = null) {
  const finalUploadId = uploadId || Date.now().toString();
  const name = `${finalUploadId}_0_${Math.floor(Math.random() * 9000000000) + 1000000000}`;
  const contentLength = photoBuffer.length;

  const ruploadParams = {
    retry_context: JSON.stringify({
      num_step_auto_retry: 0,
      num_reupload: 0,
      num_step_manual_retry: 0
    }),
    media_type: '1',
    upload_id: finalUploadId,
    xsharing_user_ids: JSON.stringify([]),
    image_compression: JSON.stringify({
      lib_name: 'moz',
      lib_version: '3.1.m',
      quality: '80'
    })
  };

  try {
    const response = await axios.post(
      `${this.baseUrl}/rupload_igphoto/${name}`,
      photoBuffer,
      {
        headers: {
          ...this.getHeaders(),
          'X-Entity-Type': 'image/jpeg',
          'Offset': '0',
          'X-Instagram-Rupload-Params': JSON.stringify(ruploadParams),
          'X-Entity-Name': name,
          'X-Entity-Length': contentLength.toString(),
          'Content-Type': 'application/octet-stream',
          'Content-Length': contentLength.toString(),
          'Accept-Encoding': 'gzip'
        },
        jar: this.cookieJar,
        withCredentials: true
      }
    );

    return {
      upload_id: response.data.upload_id || finalUploadId,
      status: response.data.status
    };
  } catch (error) {
    logger.error('Photo upload failed:', error.response?.data || error.message);
    throw new Error(`Photo upload failed: ${error.response?.data?.message || error.message}`);
  }
}
```

**File: `src/DirectMessage.js`** - Update sendPhoto method:

```javascript
async sendPhoto(threadId, photoPath) {
  try {
    const fs = await import('fs');
    const photoBuffer = fs.readFileSync(photoPath);
    
    // Step 1: Upload the photo
    const { upload_id } = await this.client.uploadPhoto(photoBuffer);
    
    // Step 2: Broadcast with upload_id
    const payload = new URLSearchParams({
      recipient_users: '[]',
      action: 'send_item',
      thread_ids: `["${threadId}"]`,
      upload_id: upload_id,
      allow_full_aspect_ratio: 'true',
      _csrftoken: this.client.getCookies().csrftoken,
      device_id: this.client.deviceId,
      _uuid: this.client.uuid
    });

    return await this.client.request(
      '/direct_v2/threads/broadcast/configure_photo/',
      'POST',
      payload.toString()
    );
  } catch (error) {
    throw new Error(`Failed to send photo: ${error.message}`);
  }
}
```

---

## 🎥 3. Video Upload Implementation

### What We Found
Video upload requires:
1. Upload video to `/rupload_igvideo/` endpoint
2. Call `/media/upload_finish/` to process the video
3. Broadcast with `configure_video` using the `upload_id`

### Implementation

**File: `src/InstagramClient.js`** - Add video upload method:

```javascript
async uploadVideo(videoBuffer, options = {}) {
  const uploadId = options.uploadId || Date.now().toString();
  const name = `${uploadId}_0_${Math.floor(Math.random() * 9000000000) + 1000000000}`;
  const contentLength = videoBuffer.length;

  const ruploadParams = {
    retry_context: JSON.stringify({
      num_step_auto_retry: 0,
      num_reupload: 0,
      num_step_manual_retry: 0
    }),
    media_type: options.mediaType || '2',
    xsharing_user_ids: JSON.stringify([]),
    upload_id: uploadId,
    upload_media_height: (options.height || 720).toString(),
    upload_media_width: (options.width || 720).toString(),
    upload_media_duration_ms: (options.duration || 3000).toString(),
  };

  if (options.isDirect) {
    ruploadParams.direct_v2 = '1';
  }

  try {
    const response = await axios.post(
      `${this.baseUrl}/rupload_igvideo/${name}`,
      videoBuffer,
      {
        headers: {
          ...this.getHeaders(),
          'X-Entity-Type': 'video/mp4',
          'Offset': '0',
          'X-Instagram-Rupload-Params': JSON.stringify(ruploadParams),
          'X-Entity-Name': name,
          'X-Entity-Length': contentLength.toString(),
          'Content-Type': 'application/octet-stream',
          'Content-Length': contentLength.toString(),
          'Accept-Encoding': 'gzip'
        },
        jar: this.cookieJar,
        withCredentials: true
      }
    );

    return {
      upload_id: response.data.upload_id || uploadId,
      status: response.data.status
    };
  } catch (error) {
    logger.error('Video upload failed:', error.response?.data || error.message);
    throw new Error(`Video upload failed: ${error.response?.data?.message || error.message}`);
  }
}

async uploadFinish(uploadId, sourceType = '2', videoLength = 3.0) {
  try {
    const payload = new URLSearchParams({
      timezone_offset: '0',
      _csrftoken: this.getCookies().csrftoken,
      source_type: sourceType,
      _uid: this.getCookies().ds_user_id,
      device_id: this.deviceId,
      _uuid: this.uuid,
      upload_id: uploadId,
      device: JSON.stringify({
        manufacturer: this.deviceManufacturer,
        model: this.deviceModel,
        android_version: this.androidVersion,
        android_release: this.androidRelease
      })
    });

    if (sourceType === '2') {
      payload.append('video', JSON.stringify({ length: videoLength }));
    }

    const response = await axios.post(
      `${this.baseUrl}/media/upload_finish/`,
      payload.toString(),
      {
        headers: this.getHeaders(),
        jar: this.cookieJar,
        withCredentials: true
      }
    );

    return response.data;
  } catch (error) {
    logger.error('Upload finish failed:', error.response?.data || error.message);
    throw new Error(`Upload finish failed: ${error.response?.data?.message || error.message}`);
  }
}
```

**File: `src/DirectMessage.js`** - Update sendVideo method:

```javascript
async sendVideo(threadId, videoPath, options = {}) {
  try {
    const fs = await import('fs');
    const videoBuffer = fs.readFileSync(videoPath);
    const uploadId = Date.now().toString();
    
    // Step 1: Upload the video
    await this.client.uploadVideo(videoBuffer, {
      uploadId,
      isDirect: true,
      duration: options.duration || 3000,
      width: options.width || 720,
      height: options.height || 720
    });
    
    // Step 2: Finish upload processing
    await this.client.uploadFinish(uploadId, '2', (options.duration || 3000) / 1000.0);
    
    // Step 3: Broadcast with upload_id
    const payload = new URLSearchParams({
      recipient_users: '[]',
      action: 'send_item',
      thread_ids: `["${threadId}"]`,
      upload_id: uploadId,
      video_result: '',
      sampled: 'true',
      _csrftoken: this.client.getCookies().csrftoken,
      device_id: this.client.deviceId,
      _uuid: this.client.uuid
    });

    return await this.client.request(
      '/direct_v2/threads/broadcast/configure_video/',
      'POST',
      payload.toString()
    );
  } catch (error) {
    throw new Error(`Failed to send video: ${error.message}`);
  }
}
```

---

## 🎤 4. Voice Note Upload Implementation

### What We Found
Voice notes are uploaded as videos with special parameters:
- `mediaType: '11'` 
- `isDirectVoice: true`
- Use `share_voice` broadcast endpoint

### Implementation

**File: `src/DirectMessage.js`** - Update sendVoiceNote method:

```javascript
async sendVoiceNote(threadId, audioPath, options = {}) {
  try {
    const fs = await import('fs');
    const audioBuffer = fs.readFileSync(audioPath);
    const uploadId = Date.now().toString();
    
    // Step 1: Upload as video with voice parameters
    await this.client.uploadVideo(audioBuffer, {
      uploadId,
      isDirectVoice: true,
      mediaType: '11',
      duration: options.duration || 3000,
      width: 0,
      height: 0
    });
    
    // Step 2: Finish upload
    await this.client.uploadFinish(uploadId, '4'); // source_type '4' for voice
    
    // Step 3: Broadcast voice note
    const waveform = options.waveform || Array.from(
      Array(20), 
      (_, i) => Math.sin(i * (Math.PI / 10)) * 0.5 + 0.5
    );
    
    const payload = new URLSearchParams({
      recipient_users: '[]',
      action: 'send_item',
      thread_ids: `["${threadId}"]`,
      upload_id: uploadId,
      waveform: JSON.stringify(waveform),
      waveform_sampling_frequency_hz: '10',
      _csrftoken: this.client.getCookies().csrftoken,
      device_id: this.client.deviceId,
      _uuid: this.client.uuid
    });

    return await this.client.request(
      '/direct_v2/threads/broadcast/share_voice/',
      'POST',
      payload.toString()
    );
  } catch (error) {
    throw new Error(`Failed to send voice note: ${error.message}`);
  }
}
```

---

## 🔧 5. Enhanced Signing Method

### What We Found
The reference library uses a cleaner signature implementation with proper formatting.

**File: `src/utils.js`** - Update signPayload:

```javascript
import crypto from 'crypto';

export function signPayload(payload, key) {
  const jsonPayload = typeof payload === 'object' ? JSON.stringify(payload) : payload;
  
  // Create HMAC signature
  const signature = crypto
    .createHmac('sha256', key)
    .update(jsonPayload)
    .digest('hex');
  
  return {
    signed_body: `${signature}.${jsonPayload}`,
    ig_sig_key_version: '4'
  };
}

// User breadcrumb for text input (used for realistic typing simulation)
export function generateUserBreadcrumb(textLength) {
  const BREADCRUMB_KEY = 'iN4$aGr0m';
  const term = (Math.floor(Math.random() * 2) + 2) * 1000 + textLength + (Math.floor(Math.random() * 6) + 15) * 1000;
  const textChangeEventCount = Math.round(textLength / (Math.floor(Math.random() * 2) + 2)) || 1;
  const data = `${textLength} ${term} ${textChangeEventCount} ${Date.now()}`;
  
  const signature = crypto
    .createHmac('sha256', BREADCRUMB_KEY)
    .update(data)
    .digest('hex');
  
  const signatureBase64 = Buffer.from(signature).toString('base64');
  const dataBase64 = Buffer.from(data).toString('base64');
  
  return `${signatureBase64}\n${dataBase64}\n`;
}
```

---

## 📦 6. Additional Constants and Headers

### What We Found
The reference library uses specific version numbers and additional headers.

**File: `src/InstagramClient.js`** - Update constants:

```javascript
constructor() {
  super();
  
  // Updated Instagram app version
  this.appVersion = '222.0.0.13.114';
  this.appVersionCode = '350696709';
  this.SIGNATURE_KEY = '9193488027538fd3450b83b7d05286d4ca9599a0f7eeed90d8c85925698a05dc';
  
  // Additional important constants
  this.bloksVersionId = '388ece79ebc0e70e87873505ed1b0ff335ae2868a978cc951b6721c41d46a30a';
  this.fbAnalyticsApplicationId = '567067343352427';
  
  // ... rest of your existing constructor
}

// Update getHeaders() method to include all important headers
getHeaders() {
  return {
    'User-Agent': this.userAgent,
    'X-IG-App-Locale': this.language,
    'X-IG-Device-Locale': this.language,
    'X-IG-Mapped-Locale': this.language,
    'X-Pigeon-Session-Id': this.pigeonSessionId,
    'X-Pigeon-Rawclienttime': (Date.now() / 1000).toFixed(3),
    'X-IG-Bandwidth-Speed-KBPS': '-1.000',
    'X-IG-Bandwidth-TotalBytes-B': '0',
    'X-IG-Bandwidth-TotalTime-MS': '0',
    'X-Bloks-Version-Id': this.bloksVersionId,
    'X-IG-WWW-Claim': this.wwwClaim || '0',
    'X-Bloks-Is-Layout-RTL': 'false',
    'X-IG-Connection-Type': this.connectionType,
    'X-IG-Capabilities': this.capabilities,
    'X-IG-App-ID': this.fbAnalyticsApplicationId,
    'X-IG-Device-ID': this.uuid,
    'X-IG-Android-ID': this.deviceId,
    'Accept-Language': this.language.replace('_', '-'),
    'X-MID': this.getCookies().mid || '',
    'Accept-Encoding': 'gzip, deflate',
    'X-FB-HTTP-Engine': 'Liger',
    'Connection': 'close',
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
  };
}
```

---

## 🔄 7. Improved Error Handling

### What We Found
The reference library has comprehensive error handling for various Instagram responses.

**File: `src/InstagramClient.js`** - Enhance error handling:

```javascript
handleError(error) {
  const response = error.response;
  
  if (!response) {
    logger.error('Network error:', error.message);
    this.emit('error', new Error('Network error: ' + error.message));
    return;
  }

  const data = response.data;
  const status = response.status;

  // Spam detection
  if (data.spam) {
    const spamError = new Error('Action blocked as spam');
    this.emit('error', spamError);
    throw spamError;
  }

  // Challenge required
  if (data.message === 'challenge_required') {
    const challengeError = new Error('Challenge required: ' + (data.challenge?.url || 'Unknown'));
    challengeError.challenge = data.challenge;
    this.emit('error', challengeError);
    throw challengeError;
  }

  // Checkpoint (similar to challenge)
  if (data.checkpoint_url) {
    const checkpointError = new Error('Checkpoint required: ' + data.checkpoint_url);
    checkpointError.checkpoint_url = data.checkpoint_url;
    this.emit('error', checkpointError);
    throw checkpointError;
  }

  // User logged out
  if (data.message === 'user_has_logged_out') {
    const logoutError = new Error('User has been logged out');
    this.emit('error', logoutError);
    throw logoutError;
  }

  // Login required
  if (data.message === 'login_required') {
    const loginError = new Error('Login required - session expired');
    this.emit('error', loginError);
    throw loginError;
  }

  // Sentry block
  if (data.error_type === 'sentry_block') {
    const sentryError = new Error('Account temporarily blocked by Instagram');
    this.emit('error', sentryError);
    throw sentryError;
  }

  // Rate limiting
  if (status === 429) {
    const retryAfter = response.headers['retry-after'] || 300;
    this.emit('rateLimit', { retryAfter, message: data.message });
    throw new Error(`Rate limited. Retry after ${retryAfter} seconds`);
  }

  // Not found
  if (status === 404) {
    throw new Error('Resource not found (404)');
  }

  // Generic error
  const errorMessage = data.message || data.error_title || 'Unknown error';
  logger.error(`Instagram API error (${status}):`, errorMessage);
  throw new Error(`Instagram API error: ${errorMessage}`);
}
```

---

## 📋 Summary of Key Changes

### Priority 1 (Essential):
1. ✅ **Update Signature Key** - Replace placeholder with real key
2. ✅ **Photo Upload** - Implement proper upload flow
3. ✅ **Video Upload** - Implement with uploadFinish step
4. ✅ **Voice Note** - Implement as special video type

### Priority 2 (Recommended):
5. ✅ **Enhanced Headers** - Add all Instagram mobile app headers
6. ✅ **Better Error Handling** - Comprehensive error detection
7. ✅ **App Version Update** - Use current Instagram version

### Priority 3 (Optional):
8. User breadcrumb generation for realistic typing
9. Additional endpoints like stories, reels sharing
10. Proxy support for production use

---

## 🧪 Testing the Implementation

Create a test file `test-media-upload.js`:

```javascript
import InstagramChatAPI from './src/index.js';

async function testMediaUpload() {
  const bot = new InstagramChatAPI();
  
  // Use cookies (recommended)
  bot.loadCookiesFromFile('./cookies.txt');
  
  try {
    // Test photo upload
    console.log('Testing photo upload...');
    await bot.dm.sendPhoto('THREAD_ID_HERE', './test-image.jpg');
    console.log('✅ Photo sent successfully!');
    
    // Test video upload
    console.log('Testing video upload...');
    await bot.dm.sendVideo('THREAD_ID_HERE', './test-video.mp4', {
      duration: 5000,
      width: 720,
      height: 1280
    });
    console.log('✅ Video sent successfully!');
    
    // Test voice note
    console.log('Testing voice note...');
    await bot.dm.sendVoiceNote('THREAD_ID_HERE', './test-audio.mp4', {
      duration: 3000
    });
    console.log('✅ Voice note sent successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testMediaUpload();
```

---

## ⚠️ Important Notes

1. **Signature Key**: The extracted key is from version 222.0.0.13.114. Instagram may change this in future versions.

2. **Media Format Requirements**:
   - Photos: JPEG format, recommended max 1080x1080px
   - Videos: MP4 format, H.264 codec, max 60 seconds for direct messages
   - Voice: MP4 audio, max 60 seconds

3. **Rate Limiting**: Instagram aggressively rate-limits media uploads. Implement delays between uploads.

4. **Cookie-Based Auth**: Still recommended over username/password login, even with the real signature key.

5. **Version Updates**: Monitor Instagram app updates and adjust version numbers accordingly.

---

## 📚 References

- Instagram API Version: 222.0.0.13.114
- Signature Version: 4
- Last Updated: October 2025
