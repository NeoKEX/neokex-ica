/**
 * @module api/posts
 * Post interactions — like, comment, upload photo/video/carousel, save, delete.
 *
 * @author NeoKEX (https://github.com/NeoKEX)
 * @license MIT
 */

import type { IgApiClient } from 'instagram-private-api';
import { readFileSync } from 'fs';
import sharp  from 'sharp';
import logger from '../logger.js';

export class PostsAPI {
  constructor(private readonly ig: IgApiClient) {}

  // ─── Likes ─────────────────────────────────────────────────────────────────

  async likePost(mediaId: string): Promise<void> {
    try {
      await (this.ig.media as unknown as { like(o: unknown): Promise<void> })
        .like({ mediaId, moduleInfo: { module_name: 'profile' }, d: 0 });
      logger.info(`Liked post ${mediaId}`);
    } catch (error) {
      logger.error('Failed to like post:', (error as Error).message);
      throw new Error(`Failed to like post: ${(error as Error).message}`);
    }
  }

  async unlikePost(mediaId: string): Promise<void> {
    try {
      await (this.ig.media as unknown as { unlike(o: unknown): Promise<void> })
        .unlike({ mediaId, moduleInfo: { module_name: 'profile' }, d: 0 });
      logger.info(`Unliked post ${mediaId}`);
    } catch (error) {
      logger.error('Failed to unlike post:', (error as Error).message);
      throw new Error(`Failed to unlike post: ${(error as Error).message}`);
    }
  }

  // ─── Comments ──────────────────────────────────────────────────────────────

  async commentPost(mediaId: string, text: string): Promise<unknown> {
    try {
      const result = await (this.ig.media as unknown as {
        comment(o: { mediaId: string; text: string }): Promise<unknown>
      }).comment({ mediaId, text });
      logger.info(`Commented on post ${mediaId}`);
      return result;
    } catch (error) {
      logger.error('Failed to comment:', (error as Error).message);
      throw new Error(`Failed to comment: ${(error as Error).message}`);
    }
  }

  async deleteComment(mediaId: string, commentId: string): Promise<void> {
    try {
      await (this.ig.media as unknown as {
        deleteComment(o: { mediaId: string; commentId: string }): Promise<void>
      }).deleteComment({ mediaId, commentId });
      logger.info(`Deleted comment ${commentId}`);
    } catch (error) {
      logger.error('Failed to delete comment:', (error as Error).message);
      throw new Error(`Failed to delete comment: ${(error as Error).message}`);
    }
  }

  async likeComment(mediaId: string, commentId: string): Promise<void> {
    try {
      await (this.ig.media as unknown as {
        likeComment(o: { mediaId: string; commentId: string }): Promise<void>
      }).likeComment({ mediaId, commentId });
      logger.info(`Liked comment ${commentId}`);
    } catch (error) {
      logger.error('Failed to like comment:', (error as Error).message);
      throw new Error(`Failed to like comment: ${(error as Error).message}`);
    }
  }

  async unlikeComment(mediaId: string, commentId: string): Promise<void> {
    try {
      await (this.ig.media as unknown as {
        unlikeComment(o: { mediaId: string; commentId: string }): Promise<void>
      }).unlikeComment({ mediaId, commentId });
      logger.info(`Unliked comment ${commentId}`);
    } catch (error) {
      logger.error('Failed to unlike comment:', (error as Error).message);
      throw new Error(`Failed to unlike comment: ${(error as Error).message}`);
    }
  }

  async getComments(mediaId: string, maxItems = 20): Promise<unknown[]> {
    try {
      const items = await this.ig.feed.mediaComments(mediaId).items();
      return (items as unknown[]).slice(0, maxItems);
    } catch (error) {
      logger.error('Failed to get comments:', (error as Error).message);
      throw new Error(`Failed to get comments: ${(error as Error).message}`);
    }
  }

  // ─── Media info ────────────────────────────────────────────────────────────

  async getMediaInfo(mediaId: string): Promise<unknown> {
    try {
      const info = await this.ig.media.info(mediaId);
      return (info as unknown as Record<string, unknown[]>)['items']?.[0];
    } catch (error) {
      logger.error('Failed to get media info:', (error as Error).message);
      throw new Error(`Failed to get media info: ${(error as Error).message}`);
    }
  }

  async deletePost(mediaId: string): Promise<void> {
    try {
      await (this.ig.media as unknown as { delete(o: unknown): Promise<void> })
        .delete({ mediaId });
      logger.info(`Deleted post ${mediaId}`);
    } catch (error) {
      logger.error('Failed to delete post:', (error as Error).message);
      throw new Error(`Failed to delete post: ${(error as Error).message}`);
    }
  }

  async getTaggedPosts(userId: string | number, maxItems = 30): Promise<unknown[]> {
    try {
      const items = await (this.ig.feed as unknown as {
        usertags(id: string | number): { items(): Promise<unknown[]> }
      }).usertags(userId).items();
      return (items as unknown[]).slice(0, maxItems);
    } catch (error) {
      logger.error('Failed to get tagged posts:', (error as Error).message);
      throw new Error(`Failed to get tagged posts: ${(error as Error).message}`);
    }
  }

  async getSavedPosts(maxItems = 30): Promise<unknown[]> {
    try {
      const items = await this.ig.feed.saved().items();
      return (items as unknown[]).slice(0, maxItems);
    } catch (error) {
      logger.error('Failed to get saved posts:', (error as Error).message);
      throw new Error(`Failed to get saved posts: ${(error as Error).message}`);
    }
  }

  async savePost(mediaId: string): Promise<void> {
    try {
      await (this.ig.media as unknown as { save(o: unknown): Promise<void> })
        .save({ mediaId });
      logger.info(`Saved post ${mediaId}`);
    } catch (error) {
      logger.error('Failed to save post:', (error as Error).message);
      throw new Error(`Failed to save post: ${(error as Error).message}`);
    }
  }

  async unsavePost(mediaId: string): Promise<void> {
    try {
      await (this.ig.media as unknown as { unsave(o: unknown): Promise<void> })
        .unsave({ mediaId });
      logger.info(`Unsaved post ${mediaId}`);
    } catch (error) {
      logger.error('Failed to unsave post:', (error as Error).message);
      throw new Error(`Failed to unsave post: ${(error as Error).message}`);
    }
  }

  // ─── Upload ────────────────────────────────────────────────────────────────

  async uploadPhoto(photoPath: string, caption = ''): Promise<unknown> {
    try {
      const result = await this.ig.publish.photo({
        file:    readFileSync(photoPath) as unknown as Buffer,
        caption,
      });
      logger.success('Photo uploaded to feed');
      return result;
    } catch (error) {
      logger.error('Failed to upload photo:', (error as Error).message);
      throw new Error(`Failed to upload photo: ${(error as Error).message}`);
    }
  }

  async uploadVideo(videoPath: string, caption = '', coverPath?: string): Promise<unknown> {
    try {
      const options: Record<string, unknown> = {
        video:   readFileSync(videoPath) as unknown as Buffer,
        caption,
      };
      if (coverPath) options['coverImage'] = readFileSync(coverPath) as unknown as Buffer;
      const result = await (this.ig.publish as unknown as {
        video(o: Record<string, unknown>): Promise<unknown>
      }).video(options);
      logger.success('Video uploaded to feed');
      return result;
    } catch (error) {
      logger.error('Failed to upload video:', (error as Error).message);
      throw new Error(`Failed to upload video: ${(error as Error).message}`);
    }
  }

  async uploadCarousel(photoPaths: string[], caption = ''): Promise<unknown> {
    try {
      const items = await Promise.all(photoPaths.map(async (p) => {
        const raw = readFileSync(p);
        let file: Buffer = raw as unknown as Buffer;
        try { file = Buffer.from(await sharp(file).jpeg({ quality: 85 }).toBuffer()); } catch { /* ignore */ }
        return { file };
      }));
      const result = await this.ig.publish.album({ items, caption });
      logger.success(`Carousel uploaded (${photoPaths.length} photos)`);
      return result;
    } catch (error) {
      logger.error('Failed to upload carousel:', (error as Error).message);
      throw new Error(`Failed to upload carousel: ${(error as Error).message}`);
    }
  }
}
