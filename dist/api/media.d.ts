/**
 * @module api/media
 * Media sending — photos, videos, voice notes, GIFs, stickers, links, carousels, URL downloads.
 *
 * @author NeoKEX (https://github.com/NeoKEX)
 * @license MIT
 */
import type { IgApiClient } from 'instagram-private-api';
import type { MediaInfo, DownloadedMedia } from '../types/index.js';
export declare class MediaAPI {
    private readonly ig;
    private readonly trackSeen;
    constructor(ig: IgApiClient, trackSeen: (id: string) => void);
    private parseResult;
    private track;
    sendPhoto(threadId: string, photoPath: string): Promise<Record<string, unknown>>;
    sendPhotoWithCaption(threadId: string, photoPath: string, caption?: string): Promise<Record<string, unknown>>;
    sendPhotoFromUrl(threadId: string, photoUrl: string): Promise<Record<string, unknown>>;
    sendVideo(threadId: string, videoPath: string): Promise<Record<string, unknown>>;
    sendVideoFromUrl(threadId: string, videoUrl: string): Promise<Record<string, unknown>>;
    sendVoiceNote(threadId: string, audioPath: string): Promise<Record<string, unknown>>;
    sendGif(threadId: string, giphyId: string): Promise<Record<string, unknown>>;
    sendSticker(threadId: string, stickerId: string): Promise<Record<string, unknown>>;
    sendAnimatedMedia(threadId: string, mediaId: string): Promise<Record<string, unknown>>;
    sendLink(threadId: string, linkUrl: string, linkText?: string): Promise<Record<string, unknown>>;
    shareMediaToThread(threadId: string, mediaId: string, message?: string): Promise<Record<string, unknown>>;
    getMessageMediaUrl(threadId: string, itemId: string): Promise<MediaInfo>;
    downloadMessageMedia(threadId: string, itemId: string, savePath?: string): Promise<DownloadedMedia>;
    forwardMessage(fromThreadId: string, toThreadId: string, itemId: string): Promise<Record<string, unknown>>;
    private _downloadToTemp;
}
//# sourceMappingURL=media.d.ts.map