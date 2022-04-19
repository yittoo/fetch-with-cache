import { CacheStore } from '../interfaces/Cache';
import { Method } from '../interfaces/Fetch';
import { globalStoreKey } from './constants';

export class Cache {
  private storedData: CacheStore;
  private static instance: Cache;

  private constructor() { 
    const cacheStore = this.initializeCache();
    this.storedData = cacheStore;
  }

  public static getInstance() {
    if (this.instance) {
      return this.instance;
    }

    this.instance = new Cache();
    return this.instance;
  }

  private makeCleanCache = (): CacheStore => ({
    cache: {
      GET: {},
      HEAD: {},
      POST: {},
      CONNECT: {},
      TRACE: {},
      TRACK: {},
      DELETE: {},
      OPTIONS: {},
      PUT: {},
    },
  });

  public cleanAllCache = () => {
    const cacheStore = this.makeCleanCache();

    this.storedData = cacheStore;
  };

  private initializeCache = () => {
    if (this.storedData) {
      throw new Error(
        'Invalid operation. A cache can not be initialized more than once. To clear cache use cleanAllCache'
      );
    }

    const cacheStore: CacheStore = this.makeCleanCache();

    if (typeof window !== 'undefined') {
      (window as { [key: string]: any })[globalStoreKey] = cacheStore;
    }
    if (typeof globalThis !== 'undefined') {
      (globalThis as { [key: string]: any })[globalStoreKey] = cacheStore;
    }

    return cacheStore;
  };

  public saveToCache = (group: Method, key: string, data: unknown) => {
    this.storedData.cache[group][key] = data;
  };

  public checkCache = (group: Method, key: string): boolean => {
    return !!this.storedData.cache[group][key];
  };

  public readCache = <T = unknown>(group: Method, key: string): T => {
    return this.storedData.cache[group][key];
  };

  public getStore = () => {
    return this.storedData;
  };
}
