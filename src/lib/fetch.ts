import { CachePolicy, FetchCustomOptions, Method, RequestOptions } from '../interfaces/Fetch';
import { combine } from './helpers';
import { Cache } from './cache';

export class FetchWithCache {
  private static cache: Cache;
  // private defaultOptions: RequestOptions | undefined;
  private static defaultCachePolicy: CachePolicy;
  private static instance: FetchWithCache;

  private constructor(cache: Cache) {
    FetchWithCache.cache = cache;
    // this.defaultOptions = defaultOptions;
    FetchWithCache.defaultCachePolicy = CachePolicy.networkOnly;
  }

  private static isInitialized(): boolean {
    return !!FetchWithCache.instance;
  }

  private static initialize(): FetchWithCache {
    if (this.instance) {
      return this.instance;
    }
    const cache = Cache.getInstance();
    this.instance = new FetchWithCache(cache);
    return this.instance;
  }

  private static assertInitialization() {
    if (!FetchWithCache.isInitialized()) {
      FetchWithCache.initialize();
    }
  }

  private static baseFetch = async <T, R>(
    url: string,
    options: RequestOptions<T>,
    customOptions: FetchCustomOptions
  ): Promise<R> => {
    // const optionsWithDefaults = combine(this.defaultOptions, options);

    const response = await fetch(url, options);

    if (response.ok) {
      return customOptions.onSuccess<R>(response);
    }

    return customOptions.onError(response);
  };

  private static shouldDoNetworkRequest = (cachePolicy: CachePolicy, method: Method, url: string): boolean => {
    return (
      cachePolicy === CachePolicy.networkOnly ||
      cachePolicy === CachePolicy.noCache ||
      (cachePolicy === CachePolicy.cacheFirst && !this.cache.checkCache(method, url))
    );
  };

  private static generateRequestWithMethod =
    <T, R>(method: Method) =>
      (url: string, options: RequestOptions<T> | undefined, customOptions: FetchCustomOptions): Promise<R> => {
        FetchWithCache.assertInitialization();

        const optionsWithMethod = combine(options, {
          method,
        }) as RequestOptions<T>;

        const cachePolicy = customOptions ? customOptions.cachePolicy : this.defaultCachePolicy;

        let result: Promise<R>;

        if (this.shouldDoNetworkRequest(cachePolicy, method, url)) {
          result = FetchWithCache.baseFetch<T, R>(url, optionsWithMethod, customOptions);

          if (cachePolicy !== CachePolicy.noCache) {
            this.cache.saveToCache(method, url, result);
          }
        } else {
          result = this.cache.readCache(method, url);
        }

        return result;
      };

  /**
   * Fetch with GET method
   */
  public static get = FetchWithCache.generateRequestWithMethod('GET');
  /**
   * Fetch with HEAD method
   */
  public static head = FetchWithCache.generateRequestWithMethod('HEAD');
  /**
   * Fetch with POST method
   */
  public static post = FetchWithCache.generateRequestWithMethod('POST');
  /**
   * Fetch with CONNECT method
   */
  public static connect = FetchWithCache.generateRequestWithMethod('CONNECT');
  /**
   * Fetch with TRACE method
   */
  public static trace = FetchWithCache.generateRequestWithMethod('TRACE');
  /**
   * Fetch with TRACK method
   */
  public static track = FetchWithCache.generateRequestWithMethod('TRACK');
  /**
   * Fetch with DELETE method
   */
  public static delete = FetchWithCache.generateRequestWithMethod('DELETE');
  /**
   * Fetch with OPTIONS method
   */
  public static options = FetchWithCache.generateRequestWithMethod('OPTIONS');
  /**
   * Fetch with PUT method
   */
  public static put = FetchWithCache.generateRequestWithMethod('PUT');
}
