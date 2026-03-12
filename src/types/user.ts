/**
 * @module types/user
 * User and social relationship type definitions.
 *
 * @author NeoKEX (https://github.com/NeoKEX)
 * @license MIT
 */

export interface UserInfo {
  pk: number | string;
  username: string;
  full_name: string;
  biography?: string;
  external_url?: string;
  follower_count?: number;
  following_count?: number;
  media_count?: number;
  is_private?: boolean;
  is_verified?: boolean;
  profile_pic_url?: string;
  [key: string]: unknown;
}

export interface FriendshipStatus {
  following: boolean;
  followed_by: boolean;
  blocking: boolean;
  muting: boolean;
  is_private: boolean;
  incoming_request: boolean;
  outgoing_request: boolean;
  [key: string]: unknown;
}

export interface SessionState {
  cookies: Record<string, string>;
  userId: string | null;
  username: string | null;
  deviceId?: string;
  uuid?: string;
}

export interface SessionValidationResult {
  valid: boolean;
  userId?: string | null;
  username?: string | null;
  error?: string;
}

export interface LoginResult {
  logged_in_user: unknown;
  userId: string;
  username: string;
}
