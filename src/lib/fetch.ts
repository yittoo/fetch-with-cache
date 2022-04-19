import { CachePolicy, Fetch, GenerateRequestWithMethod, Method } from '../interfaces/Fetch';
import { combine } from './helpers';
import { Cache } from './cache';
import { AnyObject } from '../interfaces/Helpers';

export class FetchWithCache {
  private static cache: Cache;
  private static defaultCachePolicy: CachePolicy;

  private constructor() {
  }

  private static isInitialized(): boolean {
    return !!FetchWithCache.cache;
  }

  private static initialize() {
    const cache = Cache.getInstance();
    FetchWithCache.defaultCachePolicy = CachePolicy.networkOnly;
    FetchWithCache.cache = cache;
  }

  private static assertInitialization() {
    if (!FetchWithCache.isInitialized()) {
      FetchWithCache.initialize();
    }
  }

  private static baseFetch = (url: string, options: RequestInit): Promise<Response> => {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await fetch(url, options);

        if (response.ok) {
          return resolve(response);
        }

        throw response;
      } catch (error) {
        reject(error);
      }
    })

  };

  private static shouldDoNetworkRequest = (cachePolicy: CachePolicy, method: Method, url: string): boolean => {
    return (
      cachePolicy === CachePolicy.networkOnly ||
      cachePolicy === CachePolicy.noCache ||
      (cachePolicy === CachePolicy.cacheFirst && !this.cache.checkCache(method, url))
    );
  };

  private static generateRequestWithMethod: GenerateRequestWithMethod =
    (method) => async (url, options, customOptions) => {
        return new Promise(async (resolve, reject) => {
          try {
            FetchWithCache.assertInitialization();

            const optionsWithMethod = combine(options as AnyObject, {
              method,
            }) as RequestInit;

            const cachePolicy = customOptions ? customOptions.cachePolicy : this.defaultCachePolicy;

            let result: Response;

            if (this.shouldDoNetworkRequest(cachePolicy, method, url)) {
              result = await FetchWithCache.baseFetch(url, optionsWithMethod);

              if (cachePolicy !== CachePolicy.noCache) {
                const clone = result.clone();

                const dataToSave = await clone[customOptions.successDataHandler]()

                this.cache.saveToCache(method, url, dataToSave);
              }
            } else {
              result = this.cache.readCache(method, url);
            }
            resolve(result);
          } catch (error) {
            reject(error);
          }
        })
      };

  /**
   * Fetch with GET method
   * @param {string} url
   * @param {RequestOptions} RequestOptions native fetch options
   * @param {FetchCustomOptions} FetchCustomOptions object to define FetchWithStore options
   * @returns {Response} fetch api Response object
   */
  public static get: Fetch = FetchWithCache.generateRequestWithMethod('GET');
  /**
   * Fetch with HEAD method
   * @param {string} url
   * @param {RequestOptions} RequestOptions native fetch options
   * @param {FetchCustomOptions} FetchCustomOptions object to define FetchWithStore options
   * @returns {Response} fetch api Response object
   */
  public static head: Fetch = FetchWithCache.generateRequestWithMethod('HEAD');
  /**
   * Fetch with POST method
   * @param {string} url
   * @param {RequestOptions} RequestOptions native fetch options
   * @param {FetchCustomOptions} FetchCustomOptions object to define FetchWithStore options
   * @returns {Response} fetch api Response object
   */
  public static post: Fetch = FetchWithCache.generateRequestWithMethod('POST');
  /**
   * Fetch with CONNECT method
   * @param {string} url
   * @param {RequestOptions} RequestOptions native fetch options
   * @param {FetchCustomOptions} FetchCustomOptions object to define FetchWithStore options
   * @returns {Response} fetch api Response object
   */
  public static connect: Fetch = FetchWithCache.generateRequestWithMethod('CONNECT');
  /**
   * Fetch with TRACE method
   * @param {string} url
   * @param {RequestOptions} RequestOptions native fetch options
   * @param {FetchCustomOptions} FetchCustomOptions object to define FetchWithStore options
   * @returns {Response} fetch api Response object
   */
  public static trace: Fetch = FetchWithCache.generateRequestWithMethod('TRACE');
  /**
   * Fetch with TRACK method
   * @param {string} url
   * @param {RequestOptions} RequestOptions native fetch options
   * @param {FetchCustomOptions} FetchCustomOptions object to define FetchWithStore options
   * @returns {Response} fetch api Response object
   */
  public static track: Fetch = FetchWithCache.generateRequestWithMethod('TRACK');
  /**
   * Fetch with DELETE method
   * @param {string} url
   * @param {RequestOptions} RequestOptions native fetch options
   * @param {FetchCustomOptions} FetchCustomOptions object to define FetchWithStore options
   * @returns {Response} fetch api Response object
   */
  public static delete: Fetch = FetchWithCache.generateRequestWithMethod('DELETE');
  /**
   * Fetch with OPTIONS method
   * @param {string} url
   * @param {RequestOptions} RequestOptions native fetch options
   * @param {FetchCustomOptions} FetchCustomOptions object to define FetchWithStore options
   * @returns {Response} fetch api Response object
   */
  public static options: Fetch = FetchWithCache.generateRequestWithMethod('OPTIONS');
  /**
   * Fetch with PUT method
   * @param {string} url
   * @param {RequestOptions} RequestOptions native fetch options
   * @param {FetchCustomOptions} FetchCustomOptions object to define FetchWithStore options
   * @returns {Response} fetch api Response object
   */
  public static put: Fetch = FetchWithCache.generateRequestWithMethod('PUT');
}
