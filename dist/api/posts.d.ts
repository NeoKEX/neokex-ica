/**
 * @module api/posts
 * Post interactions — like, comment, upload photo/video/carousel, save, delete.
 *
 * @author NeoKEX (https://github.com/NeoKEX)
 * @license MIT
 */
import type { IgApiClient } from 'instagram-private-api';
export declare class PostsAPI {
    private readonly ig;
    constructor(ig: IgApiClient);
    likePost(mediaId: string): Promise<void>;
    unlikePost(mediaId: string): Promise<void>;
    commentPost(mediaId: string, text: string): Promise<unknown>;
    deleteComment(mediaId: string, commentId: string): Promise<void>;
    likeComment(mediaId: string, commentId: string): Promise<void>;
    unlikeComment(mediaId: string, commentId: string): Promise<void>;
    getComments(mediaId: string, maxItems?: number): Promise<unknown[]>;
    getMediaInfo(mediaId: string): Promise<unknown>;
    deletePost(mediaId: string): Promise<void>;
    getTaggedPosts(userId: string | number, maxItems?: number): Promise<unknown[]>;
    getSavedPosts(maxItems?: number): Promise<unknown[]>;
    savePost(mediaId: string): Promise<void>;
    unsavePost(mediaId: string): Promise<void>;
    uploadPhoto(photoPath: string, caption?: string): Promise<unknown>;
    uploadVideo(videoPath: string, caption?: string, coverPath?: string): Promise<unknown>;
    uploadCarousel(photoPaths: string[], caption?: string): Promise<unknown>;
}
//# sourceMappingURL=posts.d.ts.map