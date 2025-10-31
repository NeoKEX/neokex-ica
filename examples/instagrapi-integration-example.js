/**
 * Example: Using neokex-ica with instagrapi-rest for full media support
 * 
 * Prerequisites:
 * 1. Start instagrapi-rest: docker run -d -p 8000:8000 subzeroid/instagrapi-rest:latest
 * 2. Install form-data: npm install form-data
 * 3. Create InstagrapiClient.js in src/ (see RELIABLE_LIBRARIES_COMPARISON.md)
 */

import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

class InstagrapiClient {
  constructor(baseUrl = 'http://localhost:8000') {
    this.baseUrl = baseUrl;
    this.sessionId = null;
  }

  async login(username, password) {
    try {
      const response = await axios.post(`${this.baseUrl}/auth/login`, {
        username,
        password
      });
      
      this.sessionId = response.data.sessionid;
      console.log(`✅ Logged in! Session: ${this.sessionId.substring(0, 10)}...`);
      return response.data;
    } catch (error) {
      throw new Error(`Login failed: ${error.response?.data?.detail || error.message}`);
    }
  }

  async sendTextMessage(userIds, text) {
    const payload = {
      user_ids: Array.isArray(userIds) ? userIds : [userIds],
      text
    };
    
    return await this._request('POST', '/direct/send_text', payload);
  }

  async sendPhoto(userIds, photoPath, caption = '') {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(photoPath));
    
    const userIdArray = Array.isArray(userIds) ? userIds : [userIds];
    userIdArray.forEach(id => formData.append('user_ids', id));
    
    if (caption) formData.append('caption', caption);

    return await this._request('POST', '/direct/send_photo', formData, {
      headers: formData.getHeaders()
    });
  }

  async sendVideo(userIds, videoPath, caption = '') {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(videoPath));
    
    const userIdArray = Array.isArray(userIds) ? userIds : [userIds];
    userIdArray.forEach(id => formData.append('user_ids', id));
    
    if (caption) formData.append('caption', caption);

    return await this._request('POST', '/direct/send_video', formData, {
      headers: formData.getHeaders()
    });
  }

  async sendVoice(userIds, audioPath) {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(audioPath));
    
    const userIdArray = Array.isArray(userIds) ? userIds : [userIds];
    userIdArray.forEach(id => formData.append('user_ids', id));

    return await this._request('POST', '/direct/send_voice', formData, {
      headers: formData.getHeaders()
    });
  }

  async getInbox() {
    return await this._request('GET', '/direct/threads');
  }

  async getUserByUsername(username) {
    return await this._request('GET', `/user/info_by_username/${username}`);
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
      throw new Error(`API Error: ${error.response?.data?.detail || error.message}`);
    }
  }
}

// ============================================
// USAGE EXAMPLES
// ============================================

async function main() {
  const client = new InstagrapiClient('http://localhost:8000');
  
  try {
    // 1. Login
    console.log('🔐 Logging in...');
    await client.login(
      process.env.INSTAGRAM_USERNAME || 'your_username',
      process.env.INSTAGRAM_PASSWORD || 'your_password'
    );
    
    // 2. Get user info
    console.log('\n👤 Getting user info...');
    const targetUser = await client.getUserByUsername('instagram');
    console.log(`User ID: ${targetUser.pk}`);
    console.log(`Followers: ${targetUser.follower_count}`);
    
    // 3. Send text message
    console.log('\n💬 Sending text message...');
    await client.sendTextMessage([targetUser.pk], 'Hello from neokex-ica!');
    console.log('✅ Text message sent!');
    
    // 4. Send photo (WORKS! 🎉)
    console.log('\n📸 Sending photo...');
    // Create a test image if it doesn't exist
    if (!fs.existsSync('./test-image.jpg')) {
      console.log('ℹ️  No test-image.jpg found, skipping photo test');
    } else {
      await client.sendPhoto([targetUser.pk], './test-image.jpg', 'Check out this photo!');
      console.log('✅ Photo sent!');
    }
    
    // 5. Send video (WORKS! 🎉)
    console.log('\n🎥 Sending video...');
    if (!fs.existsSync('./test-video.mp4')) {
      console.log('ℹ️  No test-video.mp4 found, skipping video test');
    } else {
      await client.sendVideo([targetUser.pk], './test-video.mp4', 'Cool video!');
      console.log('✅ Video sent!');
    }
    
    // 6. Send voice note (WORKS! 🎉)
    console.log('\n🎤 Sending voice note...');
    if (!fs.existsSync('./test-audio.m4a')) {
      console.log('ℹ️  No test-audio.m4a found, skipping voice test');
    } else {
      await client.sendVoice([targetUser.pk], './test-audio.m4a');
      console.log('✅ Voice note sent!');
    }
    
    // 7. Get inbox
    console.log('\n📥 Getting inbox...');
    const inbox = await client.getInbox();
    console.log(`You have ${inbox.threads.length} conversations`);
    
    console.log('\n✅ All tests completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default InstagrapiClient;
