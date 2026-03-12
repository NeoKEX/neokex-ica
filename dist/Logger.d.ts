declare const _default: Logger;
export default _default;
declare class Logger {
    constructor(prefix?: string);
    prefix: string;
    colors: {
        reset: string;
        bright: string;
        dim: string;
        black: string;
        red: string;
        green: string;
        yellow: string;
        blue: string;
        magenta: string;
        cyan: string;
        white: string;
        bgBlack: string;
        bgRed: string;
        bgGreen: string;
        bgYellow: string;
        bgBlue: string;
        bgMagenta: string;
        bgCyan: string;
        bgWhite: string;
    };
    getTimestamp(): string;
    formatMessage(level: any, color: any, message: any, data?: null): string;
    info(message: any, data?: null): void;
    success(message: any, data?: null): void;
    warn(message: any, data?: null): void;
    error(message: any, data?: null): void;
    debug(message: any, data?: null): void;
    event(message: any, data?: null): void;
    login(username: any): void;
    auth(message: any, data?: null): void;
    network(method: any, endpoint: any): void;
    rateLimit(retryAfter: any): void;
    session(message: any): void;
    message(from: any, preview: any): void;
    custom(level: any, color: any, message: any, data?: null): void;
}
//# sourceMappingURL=Logger.d.ts.map