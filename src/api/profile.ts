/**
 * @module api/profile
 * Profile management — edit, set picture, remove picture, change password.
 *
 * @author NeoKEX (https://github.com/NeoKEX)
 * @license MIT
 */

import type { IgApiClient } from 'instagram-private-api';
import { readFileSync } from 'fs';
import sharp  from 'sharp';
import logger from '../logger.js';
import type { EditProfileOptions } from '../types/index.js';

export class ProfileAPI {
  constructor(private readonly ig: IgApiClient) {}

  async editProfile(options: EditProfileOptions = {}): Promise<unknown> {
    try {
      const current = await this.ig.account.currentUser();
      const cur     = current as unknown as Record<string, unknown>;

      const payload = {
        username:     options.username  ?? current.username,
        first_name:   options.name ?? options.fullName ?? current.full_name,
        biography:    options.biography ?? options.bio ?? (cur['biography'] as string) ?? '',
        email:        options.email     ?? (cur['email'] as string)        ?? '',
        phone_number: options.phone     ?? (cur['phone_number'] as string) ?? '',
        external_url: options.website ?? options.externalUrl ?? (cur['external_url'] as string) ?? '',
        gender:       options.gender    ?? (cur['gender'] as number)       ?? 1,
      };

      const result = await (this.ig.account as unknown as {
        editProfile(o: typeof payload): Promise<unknown>
      }).editProfile(payload);

      logger.success('Profile updated');
      return result;
    } catch (error) {
      logger.error('Failed to edit profile:', (error as Error).message);
      throw new Error(`Failed to edit profile: ${(error as Error).message}`);
    }
  }

  async setProfilePicture(photoPath: string): Promise<unknown> {
    try {
      const raw = readFileSync(photoPath);
      let picture: Buffer = raw as unknown as Buffer;
      try {
        picture = Buffer.from(await sharp(picture).resize(320, 320, { fit: 'cover' }).jpeg({ quality: 90 }).toBuffer());
      } catch { /* ignore */ }

      const result = await (this.ig.account as unknown as {
        changeProfilePicture(o: { picture: Buffer }): Promise<unknown>
      }).changeProfilePicture({ picture });

      logger.success('Profile picture updated');
      return result;
    } catch (error) {
      logger.error('Failed to set profile picture:', (error as Error).message);
      throw new Error(`Failed to set profile picture: ${(error as Error).message}`);
    }
  }

  async removeProfilePicture(): Promise<void> {
    try {
      await this.ig.account.removeProfilePicture();
      logger.success('Profile picture removed');
    } catch (error) {
      logger.error('Failed to remove profile picture:', (error as Error).message);
      throw new Error(`Failed to remove profile picture: ${(error as Error).message}`);
    }
  }

  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    try {
      await this.ig.account.changePassword(oldPassword, newPassword);
      logger.success('Password changed');
    } catch (error) {
      logger.error('Failed to change password:', (error as Error).message);
      throw new Error(`Failed to change password: ${(error as Error).message}`);
    }
  }
}
