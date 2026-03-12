/**
 * @module api/search
 * Search — hashtags and locations.
 *
 * @author NeoKEX (https://github.com/NeoKEX)
 * @license MIT
 */

import type { IgApiClient } from 'instagram-private-api';
import logger from '../logger.js';

export class SearchAPI {
  constructor(private readonly ig: IgApiClient) {}

  async searchHashtags(query: string): Promise<unknown[]> {
    try {
      const results = await this.ig.search.tags(query);
      return ((results as unknown as Record<string, unknown>)['results'] ?? results ?? []) as unknown[];
    } catch (error) {
      logger.error('Failed to search hashtags:', (error as Error).message);
      throw new Error(`Failed to search hashtags: ${(error as Error).message}`);
    }
  }

  async searchLocations(query: string): Promise<unknown[]> {
    try {
      const results = await this.ig.search.places(query);
      return ((results as unknown as Record<string, unknown>)['items'] ?? results ?? []) as unknown[];
    } catch (error) {
      logger.error('Failed to search locations:', (error as Error).message);
      throw new Error(`Failed to search locations: ${(error as Error).message}`);
    }
  }
}
