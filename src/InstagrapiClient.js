import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import logger from './Logger.js';

export default class InstagrapiClient {
  constructor(baseUrl = 'http://localhost:8000') {
    this.baseUrl = baseUrl;
    this.sessionId = null;
  }

  async login(username, password) {
    try {
      logger.info('Logging in via REST API...');
      const response = await axios.post(`${this.baseUrl}/auth/login`, {
        username,
        password
      });
      
      this.sessionId = response.data.sessionid;
      logger.success(`Logged in! Session: ${this.sessionId.substring(0, 10)}...`);
      return response.data;
    } catch (error) {
      logger.error('Login failed:', error.response?.data?.detail || error.message);
      throw new Error(`Login failed: ${error.response?.data?.detail || error.message}`);
    }
  }

  async loadSession(sessionFile) {
    try {
      const sessionData = JSON.parse(fs.readFileSync(sessionFile, 'utf8'));
      this.sessionId = sessionData.sessionid;
      
      await this.getProfile();
      logger.success('Session loaded successfully!');
      return true;
    } catch (error) {
      logger.error('Session load failed:', error.message);
      return false;
    }
  }

  saveSession(sessionFile) {
    if (!this.sessionId) {
      throw new Error('No active session to save');
    }
    fs.writeFileSync(sessionFile, JSON.stringify({ sessionid: this.sessionId }, null, 2));
    logger.success(`Session saved to ${sessionFile}`);
  }

  async getProfile() {
    return await this._request('GET', '/user/info');
  }

  async sendTextMessage(userIds, text, threadId = null) {
    const payload = threadId 
      ? { thread_id: threadId, text }
      : { user_ids: Array.isArray(userIds) ? userIds : [userIds], text };
    
    return await this._request('POST', '/direct/send_text', payload);
  }

  async sendPhoto(userIds, photoPath, caption = '', threadId = null) {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(photoPath));
    
    if (threadId) {
      formData.append('thread_id', threadId);
    } else {
      const userIdArray = Array.isArray(userIds) ? userIds : [userIds];
      userIdArray.forEach(id => formData.append('user_ids', id));
    }
    
    if (caption) formData.append('caption', caption);

    return await this._request('POST', '/direct/send_photo', formData, {
      headers: formData.getHeaders()
    });
  }

  async sendVideo(userIds, videoPath, caption = '', threadId = null) {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(videoPath));
    
    if (threadId) {
      formData.append('thread_id', threadId);
    } else {
      const userIdArray = Array.isArray(userIds) ? userIds : [userIds];
      userIdArray.forEach(id => formData.append('user_ids', id));
    }
    
    if (caption) formData.append('caption', caption);

    return await this._request('POST', '/direct/send_video', formData, {
      headers: formData.getHeaders()
    });
  }

  async sendVoice(userIds, audioPath, threadId = null) {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(audioPath));
    
    if (threadId) {
      formData.append('thread_id', threadId);
    } else {
      const userIdArray = Array.isArray(userIds) ? userIds : [userIds];
      userIdArray.forEach(id => formData.append('user_ids', id));
    }

    return await this._request('POST', '/direct/send_voice', formData, {
      headers: formData.getHeaders()
    });
  }

  async getInbox() {
    return await this._request('GET', '/direct/threads');
  }

  async getThread(threadId, amount = 20) {
    return await this._request('GET', `/direct/thread/${threadId}?amount=${amount}`);
  }

  async markSeen(threadId, messageId) {
    return await this._request('POST', `/direct/thread/${threadId}/seen`, {
      item_id: messageId
    });
  }

  async getUserByUsername(username) {
    return await this._request('GET', `/user/info_by_username/${username}`);
  }

  async getUserById(userId) {
    return await this._request('GET', `/users/${userId}`);
  }

  async _request(method, endpoint, data = null, options = {}) {
    if (!this.sessionId) {
      throw new Error('Not logged in. Call login() first.');
    }

    const config = {
      method,
      url: `${this.baseUrl}${endpoint}`,
      headers: {
        'Authorization': `Bearer ${this.sessionId}`,
        ...options.headers
      },
      ...options
    };

    if (data) {
      if (data instanceof FormData) {
        config.data = data;
      } else if (method === 'GET') {
        config.params = data;
      } else {
        config.data = data;
      }
    }

    try {
      const response = await axios(config);
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.detail || error.message;
      logger.error(`API Error:`, errorMsg);
      throw new Error(`API Error: ${errorMsg}`);
    }
  }
}
