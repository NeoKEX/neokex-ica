/**
 * @module logger
 * Colored, timestamped console logger.
 *
 * @author NeoKEX (https://github.com/NeoKEX)
 * @license MIT
 */
type Color = keyof typeof COLORS;
declare const COLORS: {
    readonly reset: "\u001B[0m";
    readonly bright: "\u001B[1m";
    readonly dim: "\u001B[2m";
    readonly red: "\u001B[31m";
    readonly green: "\u001B[32m";
    readonly yellow: "\u001B[33m";
    readonly blue: "\u001B[34m";
    readonly magenta: "\u001B[35m";
    readonly cyan: "\u001B[36m";
    readonly white: "\u001B[37m";
};
declare class Logger {
    private readonly prefix;
    constructor(prefix?: string);
    private timestamp;
    private format;
    info(message: string, data?: unknown): void;
    success(message: string, data?: unknown): void;
    warn(message: string, data?: unknown): void;
    error(message: string, data?: unknown): void;
    debug(message: string, data?: unknown): void;
    event(message: string, data?: unknown): void;
    session(message: string): void;
    login(username: string): void;
    message(from: string, preview: string): void;
    custom(level: string, color: Color, message: string, data?: unknown): void;
}
declare const _default: Logger;
export default _default;
//# sourceMappingURL=logger.d.ts.map