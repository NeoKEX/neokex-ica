/**
 * @module api/stories
 * Stories — get, upload photo story, upload video story, delete, react.
 *
 * @author NeoKEX (https://github.com/NeoKEX)
 * @license MIT
 */
import type { IgApiClient } from 'instagram-private-api';
export declare class StoriesAPI {
    private readonly ig;
    constructor(ig: IgApiClient);
    getStories(userId: string | number): Promise<unknown[]>;
    uploadStory(photoPath: string, options?: Record<string, unknown>): Promise<unknown>;
    uploadVideoStory(videoPath: string, options?: Record<string, unknown>): Promise<unknown>;
    deleteStory(mediaId: string): Promise<void>;
    reactToStory(userId: string | number, storyId: string, emoji: string): Promise<void>;
    getCloseFriendsStories(): Promise<unknown[]>;
}
//# sourceMappingURL=stories.d.ts.map