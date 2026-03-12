/**
 * @module core/client
 * Core Instagram client — authentication, session management, device state.
 *
 * @author NeoKEX (https://github.com/NeoKEX)
 * @license MIT
 */
import { IgApiClient } from 'instagram-private-api';
import { EventEmitter } from 'events';
import type { LoginResult, SessionState, SessionValidationResult } from '../types/index.js';
export declare class InstagramCore extends EventEmitter {
    readonly ig: IgApiClient;
    userId: string | null;
    username: string | null;
    isLoggedIn: boolean;
    cookies: Record<string, string>;
    constructor();
    login(username: string, password: string): Promise<LoginResult>;
    loadCookiesFromFile(filePath: string): Promise<Record<string, string>>;
    saveCookiesToFile(filePath: string, domain?: string): void;
    setCookies(cookies: Record<string, string>): void;
    getCookies(): Record<string, string>;
    validateSession(): Promise<SessionValidationResult>;
    pingSession(): Promise<boolean>;
    getSessionState(): Promise<SessionState>;
    loadSessionState(state: SessionState): Promise<void>;
    getCurrentUserID(): string | null;
    getCurrentUsername(): string | null;
    getIgClient(): IgApiClient;
}
//# sourceMappingURL=client.d.ts.map