/**
 * @module api/users
 * User info, social actions — follow, block, mute, friendship status, followers.
 *
 * @author NeoKEX (https://github.com/NeoKEX)
 * @license MIT
 */

import type { IgApiClient } from 'instagram-private-api';
import logger  from '../logger.js';
import { sleep } from '../utils/sleep.js';
import type { UserInfo, FriendshipStatus } from '../types/index.js';

export class UsersAPI {
  constructor(private readonly ig: IgApiClient) {}

  // ─── User info ─────────────────────────────────────────────────────────────

  async getUserInfo(userId: string | number): Promise<UserInfo> {
    try {
      return await this.ig.user.info(userId) as unknown as UserInfo;
    } catch (error) {
      logger.error('Failed to get user info:', (error as Error).message);
      throw new Error(`Failed to get user info: ${(error as Error).message}`);
    }
  }

  async getUserInfoByUsername(username: string): Promise<UserInfo> {
    try {
      const userId = await this.ig.user.getIdByUsername(username);
      return this.getUserInfo(userId);
    } catch (error) {
      logger.error('Failed to get user by username:', (error as Error).message);
      throw new Error(`Failed to get user by username: ${(error as Error).message}`);
    }
  }

  async searchUsers(query: string): Promise<UserInfo[]> {
    try {
      const results = await this.ig.search.users(query);
      return ((results as unknown as Record<string, unknown>)['users'] ?? results ?? []) as UserInfo[];
    } catch (error) {
      logger.error('Search failed:', (error as Error).message);
      throw new Error(`Search failed: ${(error as Error).message}`);
    }
  }

  // ─── Friendship ────────────────────────────────────────────────────────────

  async getFriendshipStatus(userId: string | number): Promise<FriendshipStatus> {
    try {
      return await this.ig.friendship.show(userId) as unknown as FriendshipStatus;
    } catch (error) {
      logger.error('Failed to get friendship status:', (error as Error).message);
      throw new Error(`Failed to get friendship status: ${(error as Error).message}`);
    }
  }

  async getFriendshipStatuses(userIds: string[]): Promise<Record<string, FriendshipStatus>> {
    try {
      const ids = userIds.map(String);
      return await this.ig.friendship.showMany(ids) as unknown as Record<string, FriendshipStatus>;
    } catch (error) {
      logger.error('Failed to get friendship statuses:', (error as Error).message);
      throw new Error(`Failed to get friendship statuses: ${(error as Error).message}`);
    }
  }

  // ─── Social actions ────────────────────────────────────────────────────────

  async followUser(userId: string | number): Promise<void> {
    try {
      await this.ig.friendship.create(userId);
      logger.info(`Followed user ${userId}`);
    } catch (error) {
      logger.error('Failed to follow user:', (error as Error).message);
      throw new Error(`Failed to follow user: ${(error as Error).message}`);
    }
  }

  async unfollowUser(userId: string | number): Promise<void> {
    try {
      await this.ig.friendship.destroy(userId);
      logger.info(`Unfollowed user ${userId}`);
    } catch (error) {
      logger.error('Failed to unfollow user:', (error as Error).message);
      throw new Error(`Failed to unfollow user: ${(error as Error).message}`);
    }
  }

  async blockUser(userId: string | number): Promise<void> {
    try {
      await this.ig.friendship.block(userId);
      logger.info(`Blocked user ${userId}`);
    } catch (error) {
      logger.error('Failed to block user:', (error as Error).message);
      throw new Error(`Failed to block user: ${(error as Error).message}`);
    }
  }

  async unblockUser(userId: string | number): Promise<void> {
    try {
      await this.ig.friendship.unblock(userId);
      logger.info(`Unblocked user ${userId}`);
    } catch (error) {
      logger.error('Failed to unblock user:', (error as Error).message);
      throw new Error(`Failed to unblock user: ${(error as Error).message}`);
    }
  }

  async getBlockedUsers(): Promise<unknown[]> {
    try {
      const feed = this.ig.feed.accountFollowers();
      return await feed.items();
    } catch (error) {
      logger.error('Failed to get blocked users:', (error as Error).message);
      throw new Error(`Failed to get blocked users: ${(error as Error).message}`);
    }
  }

  async muteUser(userId: string | number, muteStories = false, mutePosts = false): Promise<void> {
    try {
      await (this.ig.friendship as unknown as {
        mutePostsOrStoryFromFollow(o: Record<string, unknown>): Promise<void>
      }).mutePostsOrStoryFromFollow({
        targetUserId: String(userId),
        postMuteStatus: mutePosts ? 1 : 0,
        storyMuteStatus: muteStories ? 1 : 0,
      });
      logger.info(`Muted user ${userId}`);
    } catch (error) {
      logger.error('Failed to mute user:', (error as Error).message);
      throw new Error(`Failed to mute user: ${(error as Error).message}`);
    }
  }

  // ─── Followers / following ─────────────────────────────────────────────────

  async getFollowers(userId: string | number, maxItems = 100): Promise<unknown[]> {
    try {
      const feed = this.ig.feed.accountFollowers(userId);
      const all: unknown[] = [];
      do {
        const batch = await feed.items();
        all.push(...batch);
        if (feed.isMoreAvailable() && all.length < maxItems) await sleep(600);
      } while (feed.isMoreAvailable() && all.length < maxItems);
      return all.slice(0, maxItems);
    } catch (error) {
      logger.error('Failed to get followers:', (error as Error).message);
      throw new Error(`Failed to get followers: ${(error as Error).message}`);
    }
  }

  async getFollowing(userId: string | number, maxItems = 100): Promise<unknown[]> {
    try {
      const feed = this.ig.feed.accountFollowing(userId);
      const all: unknown[] = [];
      do {
        const batch = await feed.items();
        all.push(...batch);
        if (feed.isMoreAvailable() && all.length < maxItems) await sleep(600);
      } while (feed.isMoreAvailable() && all.length < maxItems);
      return all.slice(0, maxItems);
    } catch (error) {
      logger.error('Failed to get following:', (error as Error).message);
      throw new Error(`Failed to get following: ${(error as Error).message}`);
    }
  }
}
