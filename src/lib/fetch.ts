import { CachePolicy, FetchCustomOptions, Method, RequestOptions } from '../interfaces/Fetch';
import { combine } from './helpers';
import { Cache } from './cache';

export class FetchWithCache {
  private cache: Cache;
  private defaultOptions: RequestOptions | undefined;
  private defaultCachePolicy: CachePolicy;

  constructor(cache: Cache, defaultOptions?: RequestOptions) {
    this.cache = cache;
    this.defaultOptions = defaultOptions;
    this.defaultCachePolicy = CachePolicy.networkOnly;
  }

  private baseFetch = async <T, R>(
    url: string,
    options: RequestOptions<T>,
    customOptions: FetchCustomOptions
  ): Promise<R> => {
    const optionsWithDefaults = combine(this.defaultOptions, options);

    const response = await fetch(url, optionsWithDefaults);

    if (response.ok) {
      return customOptions.onSuccess<R>(response);
    }

    return customOptions.onError(response);
  };

  private shouldDoNetworkRequest = (cachePolicy: CachePolicy, method: Method, url: string): boolean => {
    return (
      cachePolicy === CachePolicy.networkOnly ||
      cachePolicy === CachePolicy.noCache ||
      (cachePolicy === CachePolicy.cacheFirst && !this.cache.checkCache(method, url))
    );
  };

  private generateRequestWithMethod =
    <T, R>(method: Method) =>
    (url: string, options: RequestOptions<T> | undefined, customOptions: FetchCustomOptions): Promise<R> => {
      const optionsWithMethod = combine(options, {
        method,
      }) as RequestOptions<T>;

      const cachePolicy = customOptions ? customOptions.cachePolicy : this.defaultCachePolicy;

      let result: Promise<R>;

      if (this.shouldDoNetworkRequest(cachePolicy, method, url)) {
        result = this.baseFetch<T, R>(url, optionsWithMethod, customOptions);

        if (cachePolicy !== CachePolicy.noCache) {
          this.cache.saveToCache(method, url, result);
        }
      } else {
        result = this.cache.readCache(method, url);
      }

      return result;
    };

  public get = this.generateRequestWithMethod('GET');
  public head = this.generateRequestWithMethod('HEAD');
  public post = this.generateRequestWithMethod('POST');
  public connect = this.generateRequestWithMethod('CONNECT');
  public trace = this.generateRequestWithMethod('TRACE');
  public track = this.generateRequestWithMethod('TRACK');
  public delete = this.generateRequestWithMethod('DELETE');
  public options = this.generateRequestWithMethod('OPTIONS');
  public put = this.generateRequestWithMethod('PUT');
}
