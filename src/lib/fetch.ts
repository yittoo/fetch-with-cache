import { CachePolicy, Fetch, FetchCustomOptions, GenerateRequestWithMethod, Method, SaveToCache, SuccessDataHandler } from '../interfaces/Fetch';
import { combine } from './helpers';
import { Cache } from './cache';
import { AnyObject } from '../interfaces/Helpers';

export class FetchWithCache {
  private static cache: Cache = Cache.getInstance();
  private static defaultCustomOptions: FetchCustomOptions = {
    cachePolicy: CachePolicy.networkOnly,
    successDataHandler: 'text'
  }

  private static getCustomOption = (customOptions: FetchCustomOptions | undefined, key: keyof FetchCustomOptions) => {
    return customOptions && customOptions[key] ? customOptions[key] : this.defaultCustomOptions[key];
  }

  private static baseFetch = (url: string, options: RequestInit): Promise<Response> => {
    return new Promise(async (resolve, reject) => {
      const response = await fetch(url, options);

      if (response.ok) {
        return resolve(response);
      }

      return reject(response);
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
          const optionsWithMethod = combine(options as AnyObject, {
            method,
          }) as RequestInit;

          const cachePolicy = this.getCustomOption(customOptions, 'cachePolicy') as CachePolicy;

          let result: Response;

          if (this.shouldDoNetworkRequest(cachePolicy, method, url)) {
            result = await FetchWithCache.baseFetch(url, optionsWithMethod);

            if (cachePolicy !== CachePolicy.noCache) {
              this.saveToCache({ result, customOptions, method, url })
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

  private static saveToCache: SaveToCache = async ({ result, customOptions, method, url }) => {
    const clone = result.clone();
    const successDataHandler = this.getCustomOption(customOptions, 'successDataHandler') as SuccessDataHandler;

    const dataToSave = await clone[successDataHandler]()

    this.cache.saveToCache(method, url, dataToSave);
  }

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
