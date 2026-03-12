/**
 * @module api/profile
 * Profile management — edit, set picture, remove picture, change password.
 *
 * @author NeoKEX (https://github.com/NeoKEX)
 * @license MIT
 */
import type { IgApiClient } from 'instagram-private-api';
import type { EditProfileOptions } from '../types/index.js';
export declare class ProfileAPI {
    private readonly ig;
    constructor(ig: IgApiClient);
    editProfile(options?: EditProfileOptions): Promise<unknown>;
    setProfilePicture(photoPath: string): Promise<unknown>;
    removeProfilePicture(): Promise<void>;
    changePassword(oldPassword: string, newPassword: string): Promise<void>;
}
//# sourceMappingURL=profile.d.ts.map