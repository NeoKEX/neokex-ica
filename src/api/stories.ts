/**
 * @module api/stories
 * Stories — get, upload photo story, upload video story.
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
      const result = await this.ig.publish.story({ file: readFileSync(photoPath), ...options });
      logger.success('Photo story uploaded');
      return result;
    } catch (error) {
      logger.error('Failed to upload story:', (error as Error).message);
      throw new Error(`Failed to upload story: ${(error as Error).message}`);
    }
  }

  async uploadVideoStory(videoPath: string, options: Record<string, unknown> = {}): Promise<unknown> {
    try {
      const result = await this.ig.publish.videoStory({ video: readFileSync(videoPath), ...options });
      logger.success('Video story uploaded');
      return result;
    } catch (error) {
      logger.error('Failed to upload video story:', (error as Error).message);
      throw new Error(`Failed to upload video story: ${(error as Error).message}`);
    }
  }
}
