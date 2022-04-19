export interface BaseFetch {}

export type Method = 'GET' | 'HEAD' | 'POST' | 'CONNECT' | 'TRACE' | 'TRACK' | 'DELETE' | 'OPTIONS' | 'PUT';

export enum CachePolicy {
  cacheFirst = 'cache-first',
  cacheOnly = 'cache-only',
  networkOnly = 'network-only',
  noCache = 'no-cache',
}

export type SuccessDataHandler = 'json' | 'text' | 'arrayBuffer' | 'blob' 

export interface FetchCustomOptions {
  /**
   * The option that dictates where to look first and whether response should be saved to cache or not
   * @constant CachePolicy.cacheFirst - look into cache first if exists return that otherwise fetch and save response to cache 
   * @constant CachePolicy.cacheOnly - look into cache and return that value. If value doesn't exist in cache do not fetch.
   * @constant CachePolicy.networkOnly - do not look into cache, fetch from network directly, save response into cache.
   * @constant CachePolicy.noCache - do not look into cache, fetch from network directly, do not save response into cache.
   */
  cachePolicy: CachePolicy;
  /**
   * How to parse the response data on success before saving it into store using native fetch response functions
   * @constant text - plain text
   * @constant json - parses json into object before saving
   * @constant arrayBuffer EXPERIMENTAL - save as arrayBuffer into store
   * @constant blob EXPERIMENTAL - save as blob into store
   */
  successDataHandler: SuccessDataHandler
}

export type Fetch = {
  (url: string, options: RequestInit | undefined, customOptions: FetchCustomOptions): Promise<Response>
}

export type GenerateRequestWithMethod = {
  (method: Method): Fetch
}