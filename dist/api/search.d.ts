/**
 * @module api/search
 * Search — hashtags and locations.
 *
 * @author NeoKEX (https://github.com/NeoKEX)
 * @license MIT
 */
import type { IgApiClient } from 'instagram-private-api';
export declare class SearchAPI {
    private readonly ig;
    constructor(ig: IgApiClient);
    searchHashtags(query: string): Promise<unknown[]>;
    searchLocations(query: string): Promise<unknown[]>;
}
//# sourceMappingURL=search.d.ts.map