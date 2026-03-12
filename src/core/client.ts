/**
 * @module core/client
 * Core Instagram client — authentication, session management, device state.
 *
 * @author NeoKEX (https://github.com/NeoKEX)
 * @license MIT
 */

import { IgApiClient } from 'instagram-private-api';
import EventEmitter    from 'eventemitter3';
import { readFileSync, writeFileSync } from 'fs';
import logger          from '../logger.js';
import { CookieManager } from './cookies.js';
import type {
  LoginResult,
  SessionState,
  SessionValidationResult,
} from '../types/index.js';

export class InstagramCore extends EventEmitter {
  readonly ig:         IgApiClient;
  userId:   string | null = null;
  username: string | null = null;
  isLoggedIn = false;
  cookies: Record<string, string> = {};

  constructor() {
    super();
    this.ig = new IgApiClient();
  }

  // ─── Authentication ────────────────────────────────────────────────────────

  async login(username: string, password: string): Promise<LoginResult> {
    try {
      logger.info(`Logging in as ${username}`);
      this.ig.state.generateDevice(username);

      const proxy = process.env['IG_PROXY'];
      if (proxy) this.ig.state.proxyUrl = proxy;

      const auth = await this.ig.account.login(username, password);

      this.userId    = auth.pk.toString();
      this.username  = auth.username;
      this.isLoggedIn = true;

      logger.success(`Logged in as ${this.username} (ID: ${this.userId})`);
      this.emit('login', { userId: this.userId, username: this.username });

      return { logged_in_user: auth, userId: this.userId, username: this.username };
    } catch (error) {
      const msg = (error as Error).message;
      logger.error('Login failed:', msg);
      throw new Error(`Login failed: ${msg}`);
    }
  }

  async loadCookiesFromFile(filePath: string): Promise<Record<string, string>> {
    try {
      logger.info(`Loading cookies from ${filePath}`);
      const cookies = CookieManager.loadFromFile(filePath);

      if (!cookies['sessionid'] || !cookies['ds_user_id']) {
        throw new Error('Invalid cookie file — missing sessionid or ds_user_id');
      }

      this.cookies = cookies;
      this.userId  = cookies['ds_user_id'] ?? null;
      this.ig.state.generateDevice(this.userId!);

      for (const [name, value] of Object.entries(cookies)) {
        await this.ig.state.cookieJar.setCookie(
          `${name}=${value}; Domain=.instagram.com; Path=/;`,
          'https://instagram.com',
        );
      }

      this.isLoggedIn = true;
      logger.success('Cookies loaded successfully');
      logger.session(`Authenticated via cookies (User ID: ${this.userId})`);
      this.emit('cookies:loaded', { cookieFile: filePath });

      try {
        const user    = await this.ig.account.currentUser();
        this.username = user.username;
        logger.info(`Verified user: ${this.username}`);
      } catch {
        logger.warn('Could not verify user from cookies — will proceed anyway');
      }

      return { ...this.cookies };
    } catch (error) {
      logger.error('Failed to load cookies:', (error as Error).message);
      throw error;
    }
  }

  saveCookiesToFile(filePath: string, domain = '.instagram.com'): void {
    CookieManager.saveToFile(filePath, this.cookies, domain);
    logger.success(`Cookies saved to ${filePath}`);
    this.emit('cookies:saved', { cookieFile: filePath });
  }

  setCookies(cookies: Record<string, string>): void {
    this.cookies = { ...this.cookies, ...cookies };
    if (cookies['ds_user_id']) this.userId = cookies['ds_user_id'];
    this.isLoggedIn = true;
  }

  getCookies(): Record<string, string> {
    return { ...this.cookies };
  }

  // ─── Session ───────────────────────────────────────────────────────────────

  async validateSession(): Promise<SessionValidationResult> {
    try {
      const user    = await this.ig.account.currentUser();
      this.username = user.username;
      logger.info(`Session valid — user: ${this.username}`);
      return { valid: true, userId: this.userId, username: this.username };
    } catch (error) {
      const msg = (error as Error).message;
      logger.error('Session validation failed:', msg);
      this.emit('session:expired', { error });
      return { valid: false, error: msg };
    }
  }

  async pingSession(): Promise<boolean> {
    try {
      await this.ig.account.currentUser();
      return true;
    } catch {
      return false;
    }
  }

  async getSessionState(): Promise<SessionState> {
    return {
      cookies:  this.cookies,
      userId:   this.userId,
      username: this.username,
      deviceId: this.ig.state.deviceId,
      uuid:     this.ig.state.uuid,
    };
  }

  async loadSessionState(state: SessionState): Promise<void> {
    if (!state.cookies) return;

    this.cookies  = state.cookies;
    this.userId   = state.userId;
    this.username = state.username;

    for (const [name, value] of Object.entries(state.cookies)) {
      await this.ig.state.cookieJar.setCookie(
        `${name}=${value}; Domain=.instagram.com; Path=/;`,
        'https://instagram.com',
      );
    }

    if (state.deviceId) this.ig.state.deviceId = state.deviceId;
    if (state.uuid)     this.ig.state.uuid     = state.uuid;

    this.isLoggedIn = true;
    logger.success('Session state loaded');
  }

  // ─── Identity helpers ──────────────────────────────────────────────────────

  getCurrentUserID(): string | null   { return this.userId;   }
  getCurrentUsername(): string | null { return this.username; }
  getIgClient(): IgApiClient          { return this.ig;       }
}
