/**
 * @module api/media
 * Media sending — photos, videos, voice notes, GIFs, stickers, links, carousels, URL downloads.
 *
 * @author NeoKEX (https://github.com/NeoKEX)
 * @license MIT
 */

import type { IgApiClient } from 'instagram-private-api';
import { readFileSync, writeFileSync, unlinkSync } from 'fs';
import sharp   from 'sharp';
import axios   from 'axios';
import logger  from '../logger.js';
import { withRetry }  from '../utils/retry.js';
import { withTimeout } from '../utils/timeout.js';
import { sleep }      from '../utils/sleep.js';
import type { MediaInfo, DownloadedMedia } from '../types/index.js';

const DOWNLOAD_TIMEOUT = 45_000;
const PHOTO_MAX_BYTES  = 8 * 1024 * 1024;

export class MediaAPI {
  constructor(
    private readonly ig:        IgApiClient,
    private readonly trackSeen: (id: string) => void,
  ) {}

  private parseResult(raw: unknown): { item_id: string; thread_id: string; timestamp: string } {
    const r = raw as Record<string, unknown>;
    const p = r?.['payload'] as Record<string, unknown> | undefined;
    return {
      item_id:   (p?.['item_id']   ?? r['item_id']   ?? '') as string,
      thread_id: (p?.['thread_id'] ?? r['thread_id'] ?? '') as string,
      timestamp: (p?.['timestamp'] ?? r['timestamp'] ?? Date.now().toString()) as string,
    };
  }

  private track(raw: unknown): ReturnType<typeof this.parseResult> {
    const result = this.parseResult(raw);
    if (result.item_id) this.trackSeen(result.item_id);
    return result;
  }

  // ─── Photo ─────────────────────────────────────────────────────────────────

  async sendPhoto(threadId: string, photoPath: string): Promise<Record<string, unknown>> {
    return withRetry(async () => {
      const original = readFileSync(photoPath);
      let buf = original;

      try {
        const img  = sharp(original);
        const meta = await img.metadata();
        const needsResize = (meta.width ?? 0) > 1080 || (meta.height ?? 0) > 1080;
        const resizeOpts  = needsResize
          ? { width: 1080, height: 1080, fit: 'inside' as const, withoutEnlargement: true }
          : undefined;

        buf = await img.resize(resizeOpts).jpeg({ quality: 85, mozjpeg: true }).toBuffer();
        if (buf.length > PHOTO_MAX_BYTES) {
          buf = await sharp(original).resize(resizeOpts).jpeg({ quality: 65, mozjpeg: true }).toBuffer();
        }
      } catch { buf = original; }

      const raw    = await (this.ig.entity.directThread(threadId) as unknown as {
        broadcastPhoto(o: { file: Buffer }): Promise<unknown>;
      }).broadcastPhoto({ file: buf });
      const result = this.track(raw);
      logger.success(`Photo sent to thread ${threadId}`);
      return result;
    }, {
      maxRetries: 3, label: 'sendPhoto',
      onRetry: ({ attempt, delay }) =>
        logger.warn(`sendPhoto retry ${attempt} in ${(delay / 1000).toFixed(1)}s`),
    });
  }

  async sendPhotoWithCaption(threadId: string, photoPath: string, caption = ''): Promise<Record<string, unknown>> {
    const result = await this.sendPhoto(threadId, photoPath);
    if (caption) {
      await sleep(400);
      await (this.ig.entity.directThread(threadId) as unknown as { broadcastText(t: string): Promise<void> })
        .broadcastText(caption);
    }
    return result;
  }

  async sendPhotoFromUrl(threadId: string, photoUrl: string): Promise<Record<string, unknown>> {
    const tmp = await this._downloadToTemp(photoUrl, 'jpg');
    try   { return await this.sendPhoto(threadId, tmp); }
    finally { try { unlinkSync(tmp); } catch { /* ignore */ } }
  }

  // ─── Video ─────────────────────────────────────────────────────────────────

  async sendVideo(threadId: string, videoPath: string): Promise<Record<string, unknown>> {
    return withRetry(async () => {
      const raw    = await (this.ig.entity.directThread(threadId) as unknown as {
        broadcastVideo(o: { video: Buffer }): Promise<unknown>;
      }).broadcastVideo({ video: readFileSync(videoPath) });
      const result = this.track(raw);
      logger.info(`Video sent to thread ${threadId}`);
      return result;
    }, { maxRetries: 2, label: 'sendVideo' });
  }

  async sendVideoFromUrl(threadId: string, videoUrl: string): Promise<Record<string, unknown>> {
    const tmp = await this._downloadToTemp(videoUrl, 'mp4', 90_000);
    try   { return await this.sendVideo(threadId, tmp); }
    finally { try { unlinkSync(tmp); } catch { /* ignore */ } }
  }

  // ─── Voice note ────────────────────────────────────────────────────────────

  async sendVoiceNote(threadId: string, audioPath: string): Promise<Record<string, unknown>> {
    return withRetry(async () => {
      const raw    = await (this.ig.entity.directThread(threadId) as unknown as {
        broadcastVoice(o: { file: Buffer }): Promise<unknown>;
      }).broadcastVoice({ file: readFileSync(audioPath) });
      const result = this.track(raw);
      logger.info(`Voice note sent to thread ${threadId}`);
      return result;
    }, { maxRetries: 2, label: 'sendVoiceNote' });
  }

  // ─── GIF / Sticker / Animated ──────────────────────────────────────────────

  async sendGif(threadId: string, giphyId: string): Promise<Record<string, unknown>> {
    const raw    = await (this.ig.entity.directThread(threadId) as unknown as {
      broadcastGiphy(o: { giphy_id: string }): Promise<unknown>;
    }).broadcastGiphy({ giphy_id: giphyId });
    const result = this.track(raw);
    logger.info(`GIF sent to thread ${threadId}`);
    return result;
  }

  async sendSticker(threadId: string, stickerId: string): Promise<Record<string, unknown>> {
    const raw    = await (this.ig.entity.directThread(threadId) as unknown as {
      broadcastSticker(o: { sticker_id: string }): Promise<unknown>;
    }).broadcastSticker({ sticker_id: stickerId });
    const result = this.track(raw);
    logger.info(`Sticker sent to thread ${threadId}`);
    return result;
  }

  async sendAnimatedMedia(threadId: string, mediaId: string): Promise<Record<string, unknown>> {
    const raw    = await (this.ig.entity.directThread(threadId) as unknown as {
      broadcastAnimatedMedia(o: { media_id: string }): Promise<unknown>;
    }).broadcastAnimatedMedia({ media_id: mediaId });
    const result = this.track(raw);
    logger.info(`Animated media sent to thread ${threadId}`);
    return result;
  }

  // ─── Link & media share ────────────────────────────────────────────────────

  async sendLink(threadId: string, linkUrl: string, linkText = ''): Promise<Record<string, unknown>> {
    const raw    = await (this.ig.entity.directThread(threadId) as unknown as {
      broadcastLink(url: string, text: string): Promise<unknown>;
    }).broadcastLink(linkUrl, linkText);
    const result = this.track(raw);
    logger.info(`Link sent to thread ${threadId}`);
    return result;
  }

  async shareMediaToThread(threadId: string, mediaId: string, message = ''): Promise<Record<string, unknown>> {
    const raw    = await (this.ig.entity.directThread(threadId) as unknown as {
      broadcastMediaShare(o: { media_id: string; text: string }): Promise<unknown>;
    }).broadcastMediaShare({ media_id: mediaId, text: message });
    const result = this.track(raw);
    logger.info(`Media ${mediaId} shared to thread ${threadId}`);
    return result;
  }

  // ─── Media info & download ─────────────────────────────────────────────────

  async getMessageMediaUrl(threadId: string, itemId: string): Promise<MediaInfo> {
    const threadFeed = this.ig.feed.directThread({ thread_id: threadId });
    const items      = await threadFeed.items();
    const message    = (items as Array<Record<string, unknown>>).find((i) => i['item_id'] === itemId);
    if (!message) throw new Error(`Message ${itemId} not found in thread ${threadId}`);

    const out: MediaInfo = {
      item_id:   itemId,
      item_type: message['item_type'] as string | undefined,
      media:     null,
    };

    const media = message['media'] as Record<string, unknown> | undefined;
    if (media) {
      out.media = { id: media['id'] as string, media_type: media['media_type'] as number };

      const iv2 = media['image_versions2'] as Record<string, unknown> | undefined;
      if (iv2) {
        out.media!.images = (iv2['candidates'] as Array<Record<string, number>>).map((c) => ({
          url: c['url'] as unknown as string, width: c['width']!, height: c['height']!,
        }));
      }

      const vv = media['video_versions'] as Array<Record<string, unknown>> | undefined;
      if (vv) {
        out.media!.videos = vv.map((v) => ({
          url: v['url'] as string, width: v['width'] as number,
          height: v['height'] as number, type: v['type'] as number,
        }));
      }

      const carousel = media['carousel_media'] as Array<Record<string, unknown>> | undefined;
      if (carousel) {
        out.media!.carousel = carousel.map((c) => ({
          id:     c['id'] as string,
          images: (c['image_versions2'] as Record<string, unknown>)?.['candidates'] as unknown[],
          videos: c['video_versions'] as unknown[],
        }));
      }
    }

    return out;
  }

  async downloadMessageMedia(
    threadId: string,
    itemId: string,
    savePath?: string,
  ): Promise<DownloadedMedia> {
    const info = await this.getMessageMediaUrl(threadId, itemId);
    if (!info.media) throw new Error('No media in this message');

    let url: string | undefined;
    let ext = 'jpg';

    if (info.media.videos?.length) { url = info.media.videos[0]!.url; ext = 'mp4'; }
    else if (info.media.images?.length) { url = info.media.images[0]!.url; }
    else throw new Error('No downloadable URL found');

    const res  = await axios.get(url, { responseType: 'arraybuffer', timeout: 60_000 });
    const path = savePath ?? `/tmp/media_${Date.now()}.${ext}`;
    writeFileSync(path, res.data as Buffer);

    logger.success(`Media downloaded to ${path}`);
    return { path, size: (res.data as Buffer).length, type: ext, url };
  }

  async forwardMessage(
    fromThreadId: string,
    toThreadId: string,
    itemId: string,
  ): Promise<Record<string, unknown>> {
    const info = await this.getMessageMediaUrl(fromThreadId, itemId);
    if (info.media?.videos?.length)  return this.sendVideoFromUrl(toThreadId, info.media.videos[0]!.url);
    if (info.media?.images?.length)  return this.sendPhotoFromUrl(toThreadId, info.media.images[0]!.url);
    throw new Error('Cannot forward this message type');
  }

  // ─── Internal helpers ──────────────────────────────────────────────────────

  private async _downloadToTemp(url: string, ext: string, timeoutMs = DOWNLOAD_TIMEOUT): Promise<string> {
    const response = await withTimeout(
      axios.get(url, {
        responseType: 'arraybuffer',
        timeout: timeoutMs,
        headers: { 'User-Agent': 'Mozilla/5.0' },
      }),
      timeoutMs + 5_000,
      'download',
    );
    const path = `/tmp/${ext}_${Date.now()}.${ext}`;
    writeFileSync(path, response.data as Buffer);
    return path;
  }
}
