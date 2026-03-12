/**
 * @module api/users
 * User info, social actions — follow, block, mute, friendship status, followers.
 *
 * @author NeoKEX (https://github.com/NeoKEX)
 * @license MIT
 */
import type { IgApiClient } from 'instagram-private-api';
import type { UserInfo, FriendshipStatus } from '../types/index.js';
export declare class UsersAPI {
    private readonly ig;
    constructor(ig: IgApiClient);
    getUserInfo(userId: string | number): Promise<UserInfo>;
    getUserInfoByUsername(username: string): Promise<UserInfo>;
    searchUsers(query: string): Promise<UserInfo[]>;
    getFriendshipStatus(userId: string | number): Promise<FriendshipStatus>;
    getFriendshipStatuses(userIds: string[]): Promise<Record<string, FriendshipStatus>>;
    followUser(userId: string | number): Promise<void>;
    unfollowUser(userId: string | number): Promise<void>;
    blockUser(userId: string | number): Promise<void>;
    unblockUser(userId: string | number): Promise<void>;
    getBlockedUsers(): Promise<unknown[]>;
    muteUser(userId: string | number, muteStories?: boolean, mutePosts?: boolean): Promise<void>;
    getFollowers(userId: string | number, maxItems?: number): Promise<unknown[]>;
    getFollowing(userId: string | number, maxItems?: number): Promise<unknown[]>;
}
//# sourceMappingURL=users.d.ts.map