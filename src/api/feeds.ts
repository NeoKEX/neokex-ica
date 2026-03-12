/**
 * @module api/feeds
 * Feed access — timeline, user, hashtag, explore, location, activity, notifications.
 *
 * @author NeoKEX (https://github.com/NeoKEX)
 * @license MIT
 */

import type { IgApiClient } from 'instagram-private-api';
import logger from '../logger.js';

export class FeedsAPI {
  constructor(
    private readonly ig:     IgApiClient,
    private readonly userId: () => string | null,
  ) {}

  async getTimelineFeed(maxItems = 30): Promise<unknown[]> {
    try {
      const items = await this.ig.feed.timeline().items();
      return (items as unknown[]).slice(0, maxItems);
    } catch (error) {
      logger.error('Failed to get timeline:', (error as Error).message);
      throw new Error(`Failed to get timeline: ${(error as Error).message}`);
    }
  }

  async getUserFeed(userId: string | number, maxItems = 30): Promise<unknown[]> {
    try {
      const items = await this.ig.feed.user(userId).items();
      return (items as unknown[]).slice(0, maxItems);
    } catch (error) {
      logger.error('Failed to get user feed:', (error as Error).message);
      throw new Error(`Failed to get user feed: ${(error as Error).message}`);
    }
  }

  async getHashtagFeed(hashtag: string, maxItems = 30): Promise<unknown[]> {
    try {
      const items = await this.ig.feed.tag(hashtag).items();
      return (items as unknown[]).slice(0, maxItems);
    } catch (error) {
      logger.error('Failed to get hashtag feed:', (error as Error).message);
      throw new Error(`Failed to get hashtag feed: ${(error as Error).message}`);
    }
  }

  async getExploreFeed(maxItems = 30): Promise<unknown[]> {
    try {
      const items = await this.ig.feed.discover().items();
      return (items as unknown[]).slice(0, maxItems);
    } catch (error) {
      logger.error('Failed to get explore feed:', (error as Error).message);
      throw new Error(`Failed to get explore feed: ${(error as Error).message}`);
    }
  }

  async getLocationFeed(locationId: string | number, maxItems = 30): Promise<unknown[]> {
    try {
      const items = await this.ig.feed.location(locationId).items();
      return (items as unknown[]).slice(0, maxItems);
    } catch (error) {
      logger.error('Failed to get location feed:', (error as Error).message);
      throw new Error(`Failed to get location feed: ${(error as Error).message}`);
    }
  }

  async getActivityFeed(): Promise<unknown[]> {
    try {
      const uid   = this.userId();
      const items = uid
        ? await this.ig.feed.reelsMedia({ userIds: [uid] }).items()
        : [];
      return items as unknown[];
    } catch (error) {
      logger.error('Failed to get activity feed:', (error as Error).message);
      throw new Error(`Failed to get activity feed: ${(error as Error).message}`);
    }
  }

  async getNotifications(): Promise<unknown> {
    try {
      return await this.ig.news.inbox();
    } catch (error) {
      logger.error('Failed to get notifications:', (error as Error).message);
      throw new Error(`Failed to get notifications: ${(error as Error).message}`);
    }
  }

  async getReelsTrayCandidates(): Promise<unknown[]> {
    try {
      return await this.ig.feed.reelsTray().items() as unknown[];
    } catch (error) {
      logger.error('Failed to get reels tray:', (error as Error).message);
      throw new Error(`Failed to get reels tray: ${(error as Error).message}`);
    }
  }
}
