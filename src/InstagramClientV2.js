import { IgApiClient } from 'instagram-private-api';
import EventEmitter from 'eventemitter3';
import CookieManager from './CookieManager.js';
import logger from './Logger.js';
import { readFileSync } from 'fs';

export default class InstagramClientV2 extends EventEmitter {
  constructor() {
    super();
    this.ig = new IgApiClient();
    this.userId = null;
    this.username = null;
    this.isLoggedIn = false;
    this.cookies = {};
  }

  async login(username, password) {
    try {
      logger.info(`Logging in as ${username}`);
      
      this.ig.state.generateDevice(username);
      this.ig.state.proxyUrl = process.env.IG_PROXY;
      
      const auth = await this.ig.account.login(username, password);
      
      this.userId = auth.pk.toString();
      this.username = auth.username;
      this.isLoggedIn = true;
      
      logger.success(`Logged in as ${this.username} (ID: ${this.userId})`);
      this.emit('login', { userId: this.userId, username: this.username });
      
      return {
        logged_in_user: auth,
        userId: this.userId,
        username: this.username
      };
    } catch (error) {
      logger.error('Login failed:', error.message);
      throw new Error(`Login failed: ${error.message}`);
    }
  }

  async loadCookiesFromFile(filePath) {
    try {
      logger.info(`Loading cookies from ${filePath}`);
      
      const cookieContent = readFileSync(filePath, 'utf-8');
      const cookieLines = cookieContent.split('\n');
      
      const cookies = {};
      cookieLines.forEach(line => {
        if (!line.trim() || line.startsWith('# ')) return;
        let cleanLine = line.replace(/^#HttpOnly_/, '');
        const parts = cleanLine.split(/\s+/);
        if (parts.length >= 7) {
          cookies[parts[5]] = parts[6];
        }
      });
      
      this.cookies = cookies;
      
      if (cookies.sessionid && cookies.ds_user_id) {
        this.userId = cookies.ds_user_id;
        
        this.ig.state.generateDevice(this.userId);
        
        for (const [name, value] of Object.entries(cookies)) {
          await this.ig.state.cookieJar.setCookie(
            `${name}=${value}; Domain=.instagram.com; Path=/;`,
            'https://instagram.com'
          );
        }
        
        this.isLoggedIn = true;
        logger.success('Cookies loaded successfully');
        logger.session(`Authenticated via cookies (User ID: ${this.userId})`);
        this.emit('cookies:loaded', { cookieFile: filePath });
        
        try {
          const user = await this.ig.account.currentUser();
          this.username = user.username;
          logger.info(`Verified user: ${this.username}`);
        } catch (error) {
          logger.warn('Could not verify user from cookies, but will try to use them');
        }
        
        return this.cookies;
      } else {
        throw new Error('Invalid cookie file - missing sessionid or ds_user_id');
      }
    } catch (error) {
      logger.error('Failed to load cookies:', error.message);
      throw error;
    }
  }

  saveCookiesToFile(filePath, domain = '.instagram.com') {
    CookieManager.saveToFile(filePath, this.cookies, domain);
    logger.success(`Cookies saved to ${filePath}`);
    this.emit('cookies:saved', { cookieFile: filePath });
  }

  setCookies(cookies) {
    this.cookies = { ...this.cookies, ...cookies };
    
    if (cookies.ds_user_id) {
      this.userId = cookies.ds_user_id;
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
    try {
      const userInfo = await this.ig.user.info(userId);
      return userInfo;
    } catch (error) {
      logger.error('Failed to get user info:', error.message);
      throw new Error(`Failed to get user info: ${error.message}`);
    }
  }

  async getUserInfoByUsername(username) {
    try {
      const userId = await this.ig.user.getIdByUsername(username);
      return await this.getUserInfo(userId);
    } catch (error) {
      logger.error('Failed to get user by username:', error.message);
      throw new Error(`Failed to get user by username: ${error.message}`);
    }
  }

  async searchUsers(query) {
    try {
      const results = await this.ig.search.users(query);
      return results.users || results || [];
    } catch (error) {
      logger.error('Search failed:', error.message);
      throw new Error(`Search failed: ${error.message}`);
    }
  }

  getIgClient() {
    return this.ig;
  }

  async getSessionState() {
    return {
      cookies: this.cookies,
      userId: this.userId,
      username: this.username,
      deviceId: this.ig.state.deviceId,
      uuid: this.ig.state.uuid
    };
  }

  async loadSessionState(sessionState) {
    if (sessionState.cookies) {
      this.cookies = sessionState.cookies;
      this.userId = sessionState.userId;
      this.username = sessionState.username;
      
      for (const [name, value] of Object.entries(sessionState.cookies)) {
        await this.ig.state.cookieJar.setCookie(
          `${name}=${value}; Domain=.instagram.com; Path=/;`,
          'https://instagram.com'
        );
      }
      
      if (sessionState.deviceId) {
        this.ig.state.deviceId = sessionState.deviceId;
      }
      if (sessionState.uuid) {
        this.ig.state.uuid = sessionState.uuid;
      }
      
      this.isLoggedIn = true;
      logger.success('Session state loaded');
    }
  }

  async uploadPhoto(photoPath, caption = '') {
    try {
      logger.info('Uploading photo to feed');
      const photoBuffer = readFileSync(photoPath);
      const publishResult = await this.ig.publish.photo({
        file: photoBuffer,
        caption: caption
      });
      logger.success('Photo uploaded successfully');
      return publishResult;
    } catch (error) {
      logger.error('Failed to upload photo:', error.message);
      throw new Error(`Failed to upload photo: ${error.message}`);
    }
  }

  async uploadVideo(videoPath, caption = '', coverPath = null) {
    try {
      logger.info('Uploading video to feed');
      const videoBuffer = readFileSync(videoPath);
      const options = {
        video: videoBuffer,
        caption: caption
      };
      
      if (coverPath) {
        options.coverImage = readFileSync(coverPath);
      }
      
      const publishResult = await this.ig.publish.video(options);
      logger.success('Video uploaded successfully');
      return publishResult;
    } catch (error) {
      logger.error('Failed to upload video:', error.message);
      throw new Error(`Failed to upload video: ${error.message}`);
    }
  }

  async uploadStory(photoPath, options = {}) {
    try {
      logger.info('Uploading story');
      const photoBuffer = readFileSync(photoPath);
      const storyResult = await this.ig.publish.story({
        file: photoBuffer,
        ...options
      });
      logger.success('Story uploaded successfully');
      return storyResult;
    } catch (error) {
      logger.error('Failed to upload story:', error.message);
      throw new Error(`Failed to upload story: ${error.message}`);
    }
  }

  async getUserFeed(userId, maxItems = 30) {
    try {
      const userFeed = this.ig.feed.user(userId);
      const items = await userFeed.items();
      return items.slice(0, maxItems);
    } catch (error) {
      logger.error('Failed to get user feed:', error.message);
      throw new Error(`Failed to get user feed: ${error.message}`);
    }
  }

  async getTimelineFeed(maxItems = 30) {
    try {
      const timelineFeed = this.ig.feed.timeline();
      const items = await timelineFeed.items();
      return items.slice(0, maxItems);
    } catch (error) {
      logger.error('Failed to get timeline:', error.message);
      throw new Error(`Failed to get timeline: ${error.message}`);
    }
  }

  async likePost(mediaId) {
    try {
      await this.ig.media.like({ mediaId, moduleInfo: { module_name: 'profile' }, d: 0 });
      logger.info(`Liked post ${mediaId}`);
    } catch (error) {
      logger.error('Failed to like post:', error.message);
      throw new Error(`Failed to like post: ${error.message}`);
    }
  }

  async unlikePost(mediaId) {
    try {
      await this.ig.media.unlike({ mediaId, moduleInfo: { module_name: 'profile' }, d: 0 });
      logger.info(`Unliked post ${mediaId}`);
    } catch (error) {
      logger.error('Failed to unlike post:', error.message);
      throw new Error(`Failed to unlike post: ${error.message}`);
    }
  }

  async commentPost(mediaId, text) {
    try {
      const result = await this.ig.media.comment({ mediaId, text });
      logger.info(`Commented on post ${mediaId}`);
      return result;
    } catch (error) {
      logger.error('Failed to comment:', error.message);
      throw new Error(`Failed to comment: ${error.message}`);
    }
  }

  async followUser(userId) {
    try {
      await this.ig.friendship.create(userId);
      logger.info(`Followed user ${userId}`);
    } catch (error) {
      logger.error('Failed to follow user:', error.message);
      throw new Error(`Failed to follow user: ${error.message}`);
    }
  }

  async unfollowUser(userId) {
    try {
      await this.ig.friendship.destroy(userId);
      logger.info(`Unfollowed user ${userId}`);
    } catch (error) {
      logger.error('Failed to unfollow user:', error.message);
      throw new Error(`Failed to unfollow user: ${error.message}`);
    }
  }

  async getFollowers(userId, maxItems = 100) {
    try {
      const followersFeed = this.ig.feed.accountFollowers(userId);
      const followers = await followersFeed.items();
      return followers.slice(0, maxItems);
    } catch (error) {
      logger.error('Failed to get followers:', error.message);
      throw new Error(`Failed to get followers: ${error.message}`);
    }
  }

  async getFollowing(userId, maxItems = 100) {
    try {
      const followingFeed = this.ig.feed.accountFollowing(userId);
      const following = await followingFeed.items();
      return following.slice(0, maxItems);
    } catch (error) {
      logger.error('Failed to get following:', error.message);
      throw new Error(`Failed to get following: ${error.message}`);
    }
  }

  async getMediaInfo(mediaId) {
    try {
      const mediaInfo = await this.ig.media.info(mediaId);
      return mediaInfo.items[0];
    } catch (error) {
      logger.error('Failed to get media info:', error.message);
      throw new Error(`Failed to get media info: ${error.message}`);
    }
  }

  async deletePost(mediaId) {
    try {
      await this.ig.media.delete({ mediaId });
      logger.info(`Deleted post ${mediaId}`);
    } catch (error) {
      logger.error('Failed to delete post:', error.message);
      throw new Error(`Failed to delete post: ${error.message}`);
    }
  }
}
