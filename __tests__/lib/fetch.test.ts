/* eslint-disable @typescript-eslint/no-explicit-any */

import { CachePolicy } from '../../src/interfaces/Fetch';
import { Cache } from '../../src/lib/cache';
import { FetchWithCache } from '../../src/lib/fetch';

global.fetch = jest.fn().mockResolvedValue(function () {
  const self = {
    ok: true,
    text: jest.fn(() => 'text-value'),
    json: jest.fn(() => 'json-value'),
    clone: () => self
  };
  return self;
}());

describe('FetchWithCache class', () => {
  const cache = Cache.getInstance();
  cache.saveToCache = jest.fn();
  cache.checkCache = jest.fn();
  cache.readCache = jest.fn();
  cache.getStore = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes Cache immediately upon import', async () => {
    expect((FetchWithCache as any).cache).toEqual(cache);
  });

  describe('getCustomOption', () => {
    it('returns default value if option does not exist', () => {
      const res = (FetchWithCache as any).getCustomOption({ cachePolicy: CachePolicy.cacheFirst }, 'successDataHandler');

      expect(res).toBe('text');
    });

    it('returns provided value if option does exist', () => {
      const res = (FetchWithCache as any).getCustomOption({ cachePolicy: CachePolicy.cacheFirst }, 'cachePolicy');

      expect(res).toBe(CachePolicy.cacheFirst);
    });
  });

  describe('baseFetch', () => {
    const url = 'basefetch-url';
    const fetchOptions = { method: 'GET' }

    it('resolves with response if is ok', async () => {
      const res = await (FetchWithCache as any).baseFetch(url, fetchOptions)
      const text = await res.text()

      expect(text).toBe('text-value')
    });

    it('rejects with response if is not ok', async () => {
      const okFetch = fetch;
      const mockFetchResult = {
        ok: false,
        text: jest.fn(() => 'text-value'),
        json: jest.fn(() => 'json-value'),
        clone: () => mockFetchResult
      }
      global.fetch = jest.fn().mockResolvedValue(mockFetchResult);

      expect(
        (FetchWithCache as any).baseFetch(url, fetchOptions)
      ).rejects.toEqual(mockFetchResult)

      global.fetch = okFetch;
    });
  });

  describe('generateRequestWithMethod', () => {
    it('returns true when networkOnly', () => {
      const res = (FetchWithCache as any).shouldDoNetworkRequest(CachePolicy.networkOnly);

      expect(res).toBe(true);
    });

    it('returns true when noCache', () => {
      const res = (FetchWithCache as any).shouldDoNetworkRequest(CachePolicy.noCache);

      expect(res).toBe(true);
    });

    it('returns true when cacheFirst but has no cache', () => {
      (cache.checkCache as jest.Mock).mockReturnValueOnce(false);

      const res = (FetchWithCache as any).shouldDoNetworkRequest(CachePolicy.cacheFirst);

      expect(res).toBe(true);
    });

    it('returns false when cacheFirst but has cache', () => {
      (cache.checkCache as jest.Mock).mockReturnValueOnce(true);

      const res = (FetchWithCache as any).shouldDoNetworkRequest(CachePolicy.cacheFirst);

      expect(res).toBe(false);
    });
  });

  describe('generateRequestWithMethod', () => {
    const method = 'POST';
    const url = 'url-value';

    it('does network request when shouldDoNetworkRequest is true', async () => {
      await (FetchWithCache as any)
        .generateRequestWithMethod(method)(url);

      expect(fetch).toHaveBeenCalledWith(url, { method })
    });

    it('calls text parser callback and saves to cache with default params', async () => {
      const res = await (FetchWithCache as any)
        .generateRequestWithMethod(method)(url);

      const text = res.text();

      expect(cache.saveToCache).toHaveBeenCalledWith(method, url, 'text-value');
      expect(text).toBe('text-value');
    });

    it('calls json parser callback when specified', async () => {
      const res = await (FetchWithCache as any)
        .generateRequestWithMethod(method)(url, undefined, {
          successDataHandler: 'json'
        });

      const json = res.json();

      expect(cache.saveToCache).toHaveBeenCalledWith(method, url, 'json-value');
      expect(json).toBe('json-value');
    });

    it('does not call saveToCache when noCache', async () => {
      await (FetchWithCache as any)
        .generateRequestWithMethod(method)(url, undefined, {
          cachePolicy: CachePolicy.noCache
        });

      expect(cache.saveToCache).toHaveBeenCalledTimes(0);
    });

    it('does not fetch when cacheFirst and cache exists', async () => {
      (cache.checkCache as jest.Mock).mockReturnValueOnce(true);
      (cache.readCache as jest.Mock).mockReturnValueOnce('cache value');

      const res = await (FetchWithCache as any)
        .generateRequestWithMethod(method)(url, undefined, {
          cachePolicy: CachePolicy.cacheFirst
        });

      expect(res).toBe('cache value');
      expect(cache.saveToCache).toHaveBeenCalledTimes(0);
      expect(fetch).toHaveBeenCalledTimes(0);
    });

    it('fetches when cacheFirst but cache does not exist', async () => {
      (cache.checkCache as jest.Mock).mockReturnValueOnce(false);

      await (FetchWithCache as any)
        .generateRequestWithMethod(method)(url, undefined, {
          cachePolicy: CachePolicy.cacheFirst
        });

      expect(cache.readCache).toHaveBeenCalledTimes(0);
      expect(cache.saveToCache).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    it('fetches when networkOnly even if cache exists', async () => {
      (cache.checkCache as jest.Mock).mockReturnValueOnce(true);

      await (FetchWithCache as any)
        .generateRequestWithMethod(method)(url, undefined, {
          cachePolicy: CachePolicy.networkOnly
        });

      expect(cache.readCache).toHaveBeenCalledTimes(0);
      expect(cache.saveToCache).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('saveToCache', () => {
    const url = 'http://hello.world';
    const method = 'POST';

    it('saves to cache', async () => {
      const fetchResult = await fetch('url');

      await (FetchWithCache as any).saveToCache({
        result: fetchResult,
        customOptions: {
          successDataHandler: 'text'
        },
        method,
        url
      });

      expect(cache.saveToCache).toHaveBeenCalledWith(method, url, 'text-value');
    });
  })

  describe('exported methods', () => {
    const url = 'http://hello.world';

    it('get method calls with expected params', async () => {
      await FetchWithCache.get(url);

      expect(fetch).toHaveBeenCalledWith(url, { method: 'GET' });
    });

    it('head method calls with expected params', async () => {
      await FetchWithCache.head(url);

      expect(fetch).toHaveBeenCalledWith(url, { method: 'HEAD' });
    });

    it('post method calls with expected params', async () => {
      await FetchWithCache.post(url);

      expect(fetch).toHaveBeenCalledWith(url, { method: 'POST' });
    });

    it('connect method calls with expected params', async () => {
      await FetchWithCache.connect(url);

      expect(fetch).toHaveBeenCalledWith(url, { method: 'CONNECT' });
    });

    it('trace method calls with expected params', async () => {
      await FetchWithCache.trace(url);

      expect(fetch).toHaveBeenCalledWith(url, { method: 'TRACE' });
    });

    it('track method calls with expected params', async () => {
      await FetchWithCache.track(url);

      expect(fetch).toHaveBeenCalledWith(url, { method: 'TRACK' });
    });

    it('delete method calls with expected params', async () => {
      await FetchWithCache.delete(url);

      expect(fetch).toHaveBeenCalledWith(url, { method: 'DELETE' });
    });

    it('options method calls with expected params', async () => {
      await FetchWithCache.options(url);

      expect(fetch).toHaveBeenCalledWith(url, { method: 'OPTIONS' });
    });

    it('put method calls with expected params', async () => {
      await FetchWithCache.put(url);

      expect(fetch).toHaveBeenCalledWith(url, { method: 'PUT' });
    });
  });
});
