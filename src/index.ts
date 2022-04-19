/** Interfaces */
export type { Fetch, SuccessDataHandler, CachePolicy, FetchCustomOptions, Method } from './interfaces/Fetch';
export type { CacheStore } from './interfaces/Cache';

/** Functionality */
export { FetchWithCache } from './lib/fetch';
export { Cache } from './lib/cache';
export { globalStoreKey } from './lib/constants';
export * as DefaultOptionPresets from './lib/defaultOptionPresets';
