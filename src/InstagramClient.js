import axios from 'axios';
import EventEmitter from 'eventemitter3';
import { generateDeviceId, generateUUID, generatePhoneId, generateAdId, generateWaterfallId, sleep } from './utils.js';
import CookieManager from './CookieManager.js';

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
    
    this.baseUrl = 'https://i.instagram.com/api/v1';
    this.userAgent = 'Instagram 275.0.0.27.98 Android (28/9; 480dpi; 1080x2148; OnePlus; ONEPLUS A6000; OnePlus6; qcom; en_US; 458229237)';
    this.igAppId = '567067343352427';
    this.igCapabilities = '3brTv10=';
    this.igConnectionType = 'WIFI';
    this.igConnectionSpeed = '3000kbps';
  }

  async preLoginFlow() {
    try {
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
          },
        }
      );

      if (response.headers['set-cookie']) {
        const cookies = CookieManager.extractFromResponse(response.headers);
        this.cookies = { ...this.cookies, ...cookies };
      }

      if (response.data.csrf_token) {
        this.token = response.data.csrf_token;
      }

      return true;
    } catch (error) {
      console.warn('Pre-login flow failed, continuing with login:', error.message);
      return false;
    }
  }

  async login(username, password) {
    this.username = username;
    this.password = password;

    try {
      await this.preLoginFlow();

      const timestamp = Date.now();
      const payload = new URLSearchParams({
        username: username,
        enc_password: `#PWD_INSTAGRAM_BROWSER:0:${timestamp}:${password}`,
        device_id: this.deviceId,
        phone_id: this.phoneId,
        guid: this.uuid,
        adid: this.adId,
        google_tokens: '[]',
        login_attempt_count: '0',
        jazoest: '22381',
        country_codes: JSON.stringify([{ country_code: '1', source: 'default' }]),
      });

      const cookieString = Object.entries(this.cookies)
        .map(([key, value]) => `${key}=${value}`)
        .join('; ');

      const loginResponse = await axios.post(
        `${this.baseUrl}/accounts/login/`,
        payload.toString(),
        {
          headers: {
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
            'X-CSRFToken': this.token || '',
            'Cookie': cookieString,
          },
          validateStatus: (status) => status < 500,
        }
      );

      if (loginResponse.status === 400) {
        const errorMsg = loginResponse.data?.message || 'Bad request - Check credentials';
        throw new Error(`Login failed: ${errorMsg}`);
      }

      if (loginResponse.status === 429) {
        throw new Error('Rate limited by Instagram. Please wait before trying again.');
      }

      if (loginResponse.data.two_factor_required) {
        this.twoFactorInfo = loginResponse.data.two_factor_info;
        throw new Error('Two-factor authentication required. Please use loginWith2FA()');
      }

      if (loginResponse.data.challenge) {
        throw new Error('Challenge required. Account may need verification through Instagram app.');
      }

      if (loginResponse.data.logged_in_user) {
        this.userId = loginResponse.data.logged_in_user.pk;
        this.rankToken = `${this.userId}_${this.uuid}`;
        this.token = loginResponse.headers['x-csrftoken'] || loginResponse.data.csrf_token;
        
        if (loginResponse.headers['set-cookie']) {
          const newCookies = CookieManager.extractFromResponse(loginResponse.headers);
          this.cookies = { ...this.cookies, ...newCookies };
        }

        if (this.cookies.mid) {
          this.mid = this.cookies.mid;
        }

        this.isLoggedIn = true;
        this.emit('login', { userId: this.userId, username: this.username });
        return { success: true, userId: this.userId, username: this.username };
      } else {
        const errorMsg = loginResponse.data?.message || 'No user data received';
        throw new Error(`Login failed: ${errorMsg}`);
      }
    } catch (error) {
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
    };

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
        throw new Error('Session expired. Please login again.');
      }

      if (response.status === 429) {
        this.emit('ratelimit', { 
          retryAfter: response.headers['retry-after'] || 'unknown' 
        });
        throw new Error('Rate limited by Instagram. Please wait before trying again.');
      }

      if (response.status >= 400) {
        const errorMsg = response.data?.message || `Request failed with status ${response.status}`;
        throw new Error(errorMsg);
      }

      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 429) {
        this.emit('ratelimit', { 
          retryAfter: error.response.headers['retry-after'] || 'unknown' 
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
    this.cookies = CookieManager.loadFromFile(filePath);
    
    if (this.cookies.csrftoken) {
      this.token = this.cookies.csrftoken;
    }
    
    if (this.cookies.ds_user_id) {
      this.userId = this.cookies.ds_user_id;
      this.rankToken = `${this.userId}_${this.uuid}`;
    }
    
    this.isLoggedIn = true;
    this.emit('cookies:loaded', { cookieFile: filePath });
    
    return this.cookies;
  }

  saveCookiesToFile(filePath, domain = '.instagram.com') {
    CookieManager.saveToFile(filePath, this.cookies, domain);
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
    if (sessionState.cookies) this.cookies = sessionState.cookies;
    if (sessionState.userId) {
      this.rankToken = `${this.userId}_${this.uuid}`;
      this.isLoggedIn = true;
    }
  }
}
