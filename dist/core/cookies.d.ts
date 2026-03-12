/**
 * @module core/cookies
 * Netscape-format cookie file parser and serialiser.
 *
 * @author NeoKEX (https://github.com/NeoKEX)
 * @license MIT
 */
export declare class CookieManager {
    /**
     * Parse a Netscape-format cookie file into a key/value map.
     */
    static parseNetscape(content: string): Record<string, string>;
    /**
     * Load cookies from a Netscape-format file on disk.
     * Throws if the file does not exist.
     */
    static loadFromFile(filePath: string): Record<string, string>;
    /**
     * Serialise a cookie map back to a Netscape-format file.
     */
    static saveToFile(filePath: string, cookies: Record<string, string>, domain?: string): void;
    /**
     * Render a cookie map as a `Cookie` header string.
     */
    static toString(cookies: Record<string, string>): string;
}
//# sourceMappingURL=cookies.d.ts.map