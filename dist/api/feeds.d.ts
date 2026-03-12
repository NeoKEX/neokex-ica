/**
 * @module api/feeds
 * Feed access — timeline, user, hashtag, explore, location, activity, notifications.
 *
 * @author NeoKEX (https://github.com/NeoKEX)
 * @license MIT
 */
import type { IgApiClient } from 'instagram-private-api';
export declare class FeedsAPI {
    private readonly ig;
    private readonly userId;
    constructor(ig: IgApiClient, userId: () => string | null);
    getTimelineFeed(maxItems?: number): Promise<unknown[]>;
    getUserFeed(userId: string | number, maxItems?: number): Promise<unknown[]>;
    getHashtagFeed(hashtag: string, maxItems?: number): Promise<unknown[]>;
    getExploreFeed(maxItems?: number): Promise<unknown[]>;
    getLocationFeed(locationId: string | number, maxItems?: number): Promise<unknown[]>;
    getActivityFeed(): Promise<unknown[]>;
    getNotifications(): Promise<unknown>;
    getReelsTrayCandidates(): Promise<unknown[]>;
}
//# sourceMappingURL=feeds.d.ts.map