import axios from 'axios';
import EventEmitter from 'eventemitter3';
import { generateDeviceId, generateUUID, sleep } from './utils.js';
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
    this.rankToken = null;
    this.cookies = {};
    this.isLoggedIn = false;
    
    this.baseUrl = 'https://i.instagram.com/api/v1';
    this.userAgent = 'Instagram 275.0.0.27.98 Android (28/9; 480dpi; 1080x2148; OnePlus; ONEPLUS A6000; OnePlus6; qcom; en_US; 458229237)';
  }

  async login(username, password) {
    this.username = username;
    this.password = password;

    try {
      const payload = new URLSearchParams({
        username: username,
        enc_password: `#PWD_INSTAGRAM_BROWSER:0:${Date.now()}:${password}`,
        device_id: this.deviceId,
        guid: this.uuid,
        login_attempt_count: '0',
      });

      const loginResponse = await axios.post(
        `${this.baseUrl}/accounts/login/`,
        payload.toString(),
        {
          headers: {
            'User-Agent': this.userAgent,
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          },
        }
      );

      if (loginResponse.data.logged_in_user) {
        this.userId = loginResponse.data.logged_in_user.pk;
        this.rankToken = `${this.userId}_${this.uuid}`;
        this.token = loginResponse.headers['x-csrftoken'] || loginResponse.data.csrf_token;
        
        if (loginResponse.headers['set-cookie']) {
          loginResponse.headers['set-cookie'].forEach(cookie => {
            const [cookieStr] = cookie.split(';');
            const [name, value] = cookieStr.split('=');
            this.cookies[name] = value;
          });
        }

        this.isLoggedIn = true;
        this.emit('login', { userId: this.userId, username: this.username });
        return { success: true, userId: this.userId };
      } else {
        throw new Error('Login failed: No user data received');
      }
    } catch (error) {
      this.emit('error', error);
      throw new Error(`Login failed: ${error.message}`);
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
      'Cookie': cookieString,
      'X-CSRFToken': this.token || '',
      'X-IG-App-ID': '567067343352427',
      'X-Device-ID': this.deviceId,
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
      });

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
}
