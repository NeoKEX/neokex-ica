/**
 * @module api/stories
 * Stories — get, upload photo story, upload video story, delete, react.
 *
 * @author NeoKEX (https://github.com/NeoKEX)
 * @license MIT
 */

import type { IgApiClient } from 'instagram-private-api';
import { readFileSync } from 'fs';
import logger from '../logger.js';

export class StoriesAPI {
  constructor(private readonly ig: IgApiClient) {}

  async getStories(userId: string | number): Promise<unknown[]> {
    try {
      return await this.ig.feed.userStory(userId).items() as unknown[];
    } catch (error) {
      logger.error('Failed to get stories:', (error as Error).message);
      throw new Error(`Failed to get stories: ${(error as Error).message}`);
    }
  }

  async uploadStory(photoPath: string, options: Record<string, unknown> = {}): Promise<unknown> {
    try {
      const result = await (this.ig.publish as unknown as {
        story(o: Record<string, unknown>): Promise<unknown>
      }).story({ file: readFileSync(photoPath) as unknown as Buffer, ...options });
      logger.success('Photo story uploaded');
      return result;
    } catch (error) {
      logger.error('Failed to upload story:', (error as Error).message);
      throw new Error(`Failed to upload story: ${(error as Error).message}`);
    }
  }

  async uploadVideoStory(videoPath: string, options: Record<string, unknown> = {}): Promise<unknown> {
    try {
      const result = await (this.ig.publish as unknown as {
        videoStory(o: Record<string, unknown>): Promise<unknown>
      }).videoStory({ video: readFileSync(videoPath) as unknown as Buffer, ...options });
      logger.success('Video story uploaded');
      return result;
    } catch (error) {
      logger.error('Failed to upload video story:', (error as Error).message);
      throw new Error(`Failed to upload video story: ${(error as Error).message}`);
    }
  }

  async deleteStory(mediaId: string): Promise<void> {
    try {
      await (this.ig.media as unknown as {
        delete(o: { mediaId: string; mediaType: string }): Promise<void>
      }).delete({ mediaId, mediaType: 'PHOTO' });
      logger.info(`Story ${mediaId} deleted`);
    } catch (error) {
      logger.error('Failed to delete story:', (error as Error).message);
      throw new Error(`Failed to delete story: ${(error as Error).message}`);
    }
  }

  async reactToStory(userId: string | number, storyId: string, emoji: string): Promise<void> {
    try {
      await (this.ig.direct as unknown as {
        sendReaction(o: Record<string, unknown>): Promise<void>
      }).sendReaction({ recipientUsers: [[userId]], storyId, emoji });
      logger.info(`Reacted to story ${storyId} with ${emoji}`);
    } catch (error) {
      logger.error('Failed to react to story:', (error as Error).message);
      throw new Error(`Failed to react to story: ${(error as Error).message}`);
    }
  }

  async getCloseFriendsStories(): Promise<unknown[]> {
    try {
      const tray = await (this.ig.feed as unknown as {
        reelsTray(filter?: string): { items(): Promise<unknown[]> }
      }).reelsTray('besties').items();
      return tray || [];
    } catch (error) {
      logger.error('Failed to get close friends stories:', (error as Error).message);
      throw new Error(`Failed to get close friends stories: ${(error as Error).message}`);
    }
  }
}
