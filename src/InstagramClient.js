import axios from 'axios';
import EventEmitter from 'eventemitter3';
import { generateDeviceId, generateUUID, generatePhoneId, generateAdId, generateWaterfallId, signPayload, sleep } from './utils.js';
import CookieManager from './CookieManager.js';
import logger from './Logger.js';

export default class InstagramClient extends EventEmitter {
  constructor() {
    super();
    this.username = null;
    this.password = null;
    this.userId = null;
    this.token = null;
    this.deviceId = generateDeviceId();
    this.uuid = generateUUID();
    this.phoneId = generatePhoneId();
    this.adId = generateAdId();
    this.waterfallId = generateWaterfallId();
    this.rankToken = null;
    this.cookies = {};
    this.isLoggedIn = false;
    this.mid = null;
    this.wwwClaim = null;
    this.bloksVersionId = null;
    
    this.baseUrl = 'https://i.instagram.com/api/v1';
    this.userAgent = 'Instagram 275.0.0.27.98 Android (28/9; 480dpi; 1080x2148; OnePlus; ONEPLUS A6000; OnePlus6; qcom; en_US; 458229237)';
    this.appVersion = '222.0.0.13.114';
    this.appVersionCode = '350696709';
    this.igAppId = '567067343352427';
    this.igCapabilities = '3brTv10=';
    this.igConnectionType = 'WIFI';
    this.igConnectionSpeed = '3000kbps';
    this.bloksVersionId = '388ece79ebc0e70e87873505ed1b0ff335ae2868a978cc951b6721c41d46a30a';
    this.fbAnalyticsApplicationId = '567067343352427';
    
    // Instagram signature key - Load from environment or use extracted key
    // WARNING: This key is extracted from Instagram APK and may change
    // Set INSTAGRAM_SIGNATURE_KEY environment variable to use your own
    this.SIGNATURE_KEY = process.env.INSTAGRAM_SIGNATURE_KEY || '9193488027538fd3450b83b7d05286d4ca9599a0f7eeed90d8c85925698a05dc';
    this.BREADCRUMB_KEY = 'iN4$aGr0m';
  }

  async preLoginFlow() {
    try {
      logger.auth('Initiating pre-login flow');
      const response = await axios.get(
        `${this.baseUrl}/accounts/get_prefill_candidates/`,
        {
          headers: {
            'User-Agent': this.userAgent,
            'Accept': '*/*',
            'Accept-Language': 'en-US',
            'Accept-Encoding': 'gzip, deflate',
            'X-IG-Capabilities': this.igCapabilities,
            'X-IG-Connection-Type': this.igConnectionType,
            'X-IG-Connection-Speed': this.igConnectionSpeed,
            'X-IG-App-ID': this.igAppId,
            'X-FB-HTTP-Engine': 'Liger',
            'X-Bloks-Version-Id': this.bloksVersionId,
          },
        }
      );

      if (response.headers['set-cookie']) {
        const cookies = CookieManager.extractFromResponse(response.headers);
        this.cookies = { ...this.cookies, ...cookies };
        
        if (cookies.mid) {
          this.mid = cookies.mid;
        }
      }

      if (response.data.csrf_token) {
        this.token = response.data.csrf_token;
      }
      
      if (response.headers['ig-set-www-claim']) {
        this.wwwClaim = response.headers['ig-set-www-claim'];
      }

      logger.success('Pre-login flow completed');
      return true;
    } catch (error) {
      logger.warn('Pre-login flow failed, continuing with login', { error: error.message });
      return false;
    }
  }

  async login(username, password) {
    this.username = username;
    this.password = password;

    try {
      logger.info(`Attempting login for ${username}`);
      await this.preLoginFlow();

      const timestamp = Date.now();
      const timestampSec = Math.floor(timestamp / 1000);
      const payloadData = {
        username: username,
        enc_password: `#PWD_INSTAGRAM:4:${timestampSec}:${password}`,
        device_id: this.deviceId,
        phone_id: this.phoneId,
        guid: this.uuid,
        adid: this.adId,
        google_tokens: '[]',
        login_attempt_count: '0',
        jazoest: '22381',
        country_codes: JSON.stringify([{ country_code: '1', source: 'default' }]),
        _csrftoken: this.token || '',
        _uuid: this.uuid,
      };

      const signedPayload = signPayload(payloadData, this.SIGNATURE_KEY);
      const payload = new URLSearchParams(signedPayload);

      const cookieString = Object.entries(this.cookies)
        .map(([key, value]) => `${key}=${value}`)
        .join('; ');

      const headers = {
        'User-Agent': this.userAgent,
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Accept': '*/*',
        'Accept-Language': 'en-US',
        'Accept-Encoding': 'gzip, deflate',
        'X-IG-Capabilities': this.igCapabilities,
        'X-IG-Connection-Type': this.igConnectionType,
        'X-IG-Connection-Speed': this.igConnectionSpeed,
        'X-IG-App-ID': this.igAppId,
        'X-FB-HTTP-Engine': 'Liger',
        'X-Bloks-Version-Id': this.bloksVersionId,
        'X-CSRFToken': this.token || '',
        'Cookie': cookieString,
        'X-Pigeon-Rawclienttime': (timestamp / 1000).toFixed(3),
      };

      if (this.mid) {
        headers['X-MID'] = this.mid;
      }

      if (this.wwwClaim) {
        headers['X-IG-WWW-Claim'] = this.wwwClaim;
      }

      const loginResponse = await axios.post(
        `${this.baseUrl}/accounts/login/`,
        payload.toString(),
        {
          headers,
          validateStatus: (status) => status < 500,
        }
      );

      const data = loginResponse.data;
      const status = loginResponse.status;

      if (status === 400) {
        const errorType = data?.error_type || 'bad_request';
        const errorMsg = data?.message || 'Bad request - Check credentials';
        const detailedMsg = `Login failed (${errorType}): ${errorMsg}`;
        
        if (data?.status === 'fail') {
          throw new Error(`${detailedMsg}. Status: ${data.status}`);
        }
        throw new Error(detailedMsg);
      }

      if (status === 429) {
        const errorMsg = data?.message || 'Too many requests';
        throw new Error(`Rate limited by Instagram: ${errorMsg}. Please wait before trying again.`);
      }

      if (data.two_factor_required) {
        this.twoFactorInfo = data.two_factor_info;
        const twoFactorId = data.two_factor_info?.two_factor_identifier || 'unknown';
        throw new Error(`Two-factor authentication required (ID: ${twoFactorId}). Please use loginWith2FA() or cookie-based auth.`);
      }

      if (data.challenge) {
        const challengeUrl = data.challenge?.api_path || 'unknown';
        throw new Error(`Challenge required (${challengeUrl}). Account may need verification through Instagram app.`);
      }

      if (data.logged_in_user) {
        this.userId = data.logged_in_user.pk;
        this.rankToken = `${this.userId}_${this.uuid}`;
        this.token = loginResponse.headers['x-csrftoken'] || data.csrf_token;
        
        if (loginResponse.headers['set-cookie']) {
          const newCookies = CookieManager.extractFromResponse(loginResponse.headers);
          this.cookies = { ...this.cookies, ...newCookies };
        }

        if (this.cookies.mid) {
          this.mid = this.cookies.mid;
        }
        
        if (loginResponse.headers['ig-set-www-claim']) {
          this.wwwClaim = loginResponse.headers['ig-set-www-claim'];
        }

        this.isLoggedIn = true;
        logger.login(this.username);
        logger.session(`User ID: ${this.userId}`);
        this.emit('login', { userId: this.userId, username: this.username });
        return { success: true, userId: this.userId, username: this.username };
      } else {
        const errorType = data?.error_type || 'unknown';
        const statusType = data?.status || 'unknown';
        const errorMsg = data?.message || 'No user data received';
        const error = new Error(`Login failed (${errorType}, status: ${statusType}): ${errorMsg}`);
        logger.error('Login failed', { errorType, statusType, message: errorMsg });
        throw error;
      }
    } catch (error) {
      if (!error.message.includes('Login failed')) {
        logger.error('Login error', { error: error.message });
      }
      this.emit('error', error);
      throw error;
    }
  }

  async request(endpoint, method = 'GET', data = null) {
    if (!this.isLoggedIn) {
      throw new Error('Not logged in. Call login() first.');
    }

    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;
    
    const cookieString = Object.entries(this.cookies)
      .map(([key, value]) => `${key}=${value}`)
      .join('; ');

    const headers = {
      'User-Agent': this.userAgent,
      'Accept': '*/*',
      'Accept-Language': 'en-US',
      'Accept-Encoding': 'gzip, deflate',
      'Cookie': cookieString,
      'X-CSRFToken': this.token || '',
      'X-IG-App-ID': this.igAppId,
      'X-IG-Capabilities': this.igCapabilities,
      'X-IG-Connection-Type': this.igConnectionType,
      'X-IG-Connection-Speed': this.igConnectionSpeed,
      'X-Device-ID': this.deviceId,
      'X-FB-HTTP-Engine': 'Liger',
      'X-Bloks-Version-Id': this.bloksVersionId,
      'X-Pigeon-Rawclienttime': (Date.now() / 1000).toFixed(3),
    };

    if (this.mid) {
      headers['X-MID'] = this.mid;
    }

    if (this.wwwClaim) {
      headers['X-IG-WWW-Claim'] = this.wwwClaim;
    }

    if (method === 'POST') {
      headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
    }

    try {
      const response = await axios({
        method,
        url,
        headers,
        data,
        validateStatus: (status) => status < 500,
      });

      if (response.status === 401) {
        this.isLoggedIn = false;
        const errorType = response.data?.error_type || 'unauthorized';
        logger.error('Session expired - Please login again', { errorType });
        throw new Error(`Session expired (${errorType}). Please login again.`);
      }

      if (response.status === 429) {
        const retryAfter = response.headers['retry-after'] || 'unknown';
        logger.rateLimit(retryAfter);
        this.emit('ratelimit', { retryAfter });
        throw new Error(`Rate limited by Instagram. Retry after: ${retryAfter}`);
      }

      if (response.status >= 400) {
        const errorType = response.data?.error_type || 'unknown';
        const statusType = response.data?.status || 'unknown';
        const errorMsg = response.data?.message || `Request failed with status ${response.status}`;
        
        if (response.data?.challenge) {
          const challengeUrl = response.data.challenge?.api_path || response.data.challenge?.url || 'unknown';
          logger.error('Challenge required', { errorType, challengeUrl });
          throw new Error(`Challenge required (${errorType}). Instagram needs verification. Path: ${challengeUrl}. Please login through Instagram app to verify your account.`);
        }
        
        logger.error('API request failed', { errorType, statusType, message: errorMsg });
        logger.debug('Full response data', response.data);
        throw new Error(`Request failed (${errorType}, status: ${statusType}): ${errorMsg}`);
      }

      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 429) {
        const retryAfter = error.response.headers['retry-after'] || 'unknown';
        logger.rateLimit(retryAfter);
        this.emit('ratelimit', { 
          retryAfter 
        });
      }
      
      const normalizedError = new Error(error.response?.data?.message || error.message);
      this.emit('error', normalizedError);
      throw normalizedError;
    }
  }

  async getCurrentUser() {
    const data = await this.request('/accounts/current_user/?edit=true');
    return data.user;
  }

  async searchUsers(query) {
    const data = await this.request(`/users/search/?q=${encodeURIComponent(query)}&rank_token=${this.rankToken}`);
    return data.users;
  }

  async getUserByUsername(username) {
    const data = await this.request(`/users/${username}/usernameinfo/`);
    return data.user;
  }

  loadCookiesFromFile(filePath) {
    logger.info(`Loading cookies from ${filePath}`);
    this.cookies = CookieManager.loadFromFile(filePath);
    
    if (this.cookies.csrftoken) {
      this.token = this.cookies.csrftoken;
    }
    
    if (this.cookies.ds_user_id) {
      this.userId = this.cookies.ds_user_id;
      this.rankToken = `${this.userId}_${this.uuid}`;
    }
    
    this.isLoggedIn = true;
    logger.success('Cookies loaded successfully');
    logger.session(`Authenticated via cookies (User ID: ${this.userId})`);
    this.emit('cookies:loaded', { cookieFile: filePath });
    
    return this.cookies;
  }

  saveCookiesToFile(filePath, domain = '.instagram.com') {
    CookieManager.saveToFile(filePath, this.cookies, domain);
    logger.success(`Cookies saved to ${filePath}`);
    this.emit('cookies:saved', { cookieFile: filePath });
  }

  setCookies(cookies) {
    this.cookies = { ...this.cookies, ...cookies };
    
    if (cookies.csrftoken) {
      this.token = cookies.csrftoken;
    }
    
    if (cookies.ds_user_id) {
      this.userId = cookies.ds_user_id;
      this.rankToken = `${this.userId}_${this.uuid}`;
    }
    
    this.isLoggedIn = true;
  }

  getCookies() {
    return { ...this.cookies };
  }

  getCurrentUserID() {
    return this.userId;
  }

  getCurrentUsername() {
    return this.username;
  }

  async getUserInfo(userId) {
    const data = await this.request(`/users/${userId}/info/`);
    return data.user;
  }

  async getUserInfoByUsername(username) {
    const data = await this.request(`/users/${username}/usernameinfo/`);
    return data.user;
  }

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
          }
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

    if (options.isDirectVoice) {
      ruploadParams.is_direct_voice = '1';
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
          }
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
        _csrftoken: this.cookies.csrftoken,
        source_type: sourceType,
        _uid: this.cookies.ds_user_id,
        device_id: this.deviceId,
        _uuid: this.uuid,
        upload_id: uploadId,
        device: JSON.stringify({
          manufacturer: 'OnePlus',
          model: 'ONEPLUS A6000',
          android_version: 28,
          android_release: '9.0'
        })
      });

      if (sourceType === '2') {
        payload.append('video', JSON.stringify({ length: videoLength }));
      }

      const response = await axios.post(
        `${this.baseUrl}/media/upload_finish/`,
        payload.toString(),
        {
          headers: this.getHeaders()
        }
      );

      return response.data;
    } catch (error) {
      logger.error('Upload finish failed:', error.response?.data || error.message);
      throw new Error(`Upload finish failed: ${error.response?.data?.message || error.message}`);
    }
  }

  async getSessionState() {
    return {
      userId: this.userId,
      username: this.username,
      deviceId: this.deviceId,
      uuid: this.uuid,
      phoneId: this.phoneId,
      adId: this.adId,
      waterfallId: this.waterfallId,
      token: this.token,
      mid: this.mid,
      wwwClaim: this.wwwClaim,
      bloksVersionId: this.bloksVersionId,
      cookies: this.getCookies(),
      isLoggedIn: this.isLoggedIn,
    };
  }

  loadSessionState(sessionState) {
    if (sessionState.userId) this.userId = sessionState.userId;
    if (sessionState.username) this.username = sessionState.username;
    if (sessionState.deviceId) this.deviceId = sessionState.deviceId;
    if (sessionState.uuid) this.uuid = sessionState.uuid;
    if (sessionState.phoneId) this.phoneId = sessionState.phoneId;
    if (sessionState.adId) this.adId = sessionState.adId;
    if (sessionState.waterfallId) this.waterfallId = sessionState.waterfallId;
    if (sessionState.token) this.token = sessionState.token;
    if (sessionState.mid) this.mid = sessionState.mid;
    if (sessionState.wwwClaim) this.wwwClaim = sessionState.wwwClaim;
    if (sessionState.bloksVersionId) this.bloksVersionId = sessionState.bloksVersionId;
    if (sessionState.cookies) this.cookies = sessionState.cookies;
    if (sessionState.userId) {
      this.rankToken = `${this.userId}_${this.uuid}`;
      this.isLoggedIn = true;
    }
  }
}
