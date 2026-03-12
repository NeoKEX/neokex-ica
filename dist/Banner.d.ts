declare const _default: Banner;
export default _default;
declare class Banner {
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
    };
    show(version?: string, methods?: any[]): void;
    showSimple(version?: string): void;
    showVerification(packageName: any, version: any, methods: any): void;
    wrapMethods(methods: any, columns?: number): string;
}
//# sourceMappingURL=Banner.d.ts.map