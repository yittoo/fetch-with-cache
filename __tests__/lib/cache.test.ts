import { Cache } from '../../src/lib/cache';

describe('Cache Class', () => {
  let cache: Cache;

  beforeEach(() => {
    cache = Cache.getInstance();
  });

  describe('constructor', () => {
    it('initialization store matches previous', () => {
      const storedData = cache.getStore();

      expect(storedData).toMatchSnapshot();
    });
  });

  describe('cleanAllCache', () => {
    it('cleans all cache', () => {
      cache.saveToCache('GET', 'url', 'data');

      expect(cache.getStore()).toMatchSnapshot();

      cache.cleanAllCache();

      expect(cache.getStore()).toMatchSnapshot();
    });
  });

  describe('saveToCache', () => {
    it('saves to cache', () => {
      cache.saveToCache('POST', 'url', 'data');

      expect(cache.getStore()).toMatchSnapshot();
    });
  });

  describe('saveToCache', () => {
    it('saves to cache', () => {
      cache.saveToCache('POST', 'url', 'data');

      expect(cache.getStore()).toMatchSnapshot();
    });
  });

  describe('checkCache', () => {
    it('return true if exists in cache', () => {
      cache.saveToCache('POST', 'url-existant', 'data');

      const exists = cache.checkCache('POST', 'url-existant');

      expect(exists).toBe(true);
    });

    it('return false if does exists in cache', () => {
      const exists = cache.checkCache('POST', 'url-inexistant');

      expect(exists).toBe(false);
    });
  });

  describe('readCache', () => {
    it('returns value stored in cache', () => {
      cache.saveToCache('POST', 'url-existant', 'data-value');

      const data = cache.readCache('POST', 'url-existant');

      expect(data).toBe('data-value');
    });

    it('return undefined if empty', () => {
      const data = cache.readCache('POST', 'url-inexistant');

      expect(data).toBe(undefined);
    });
  });
});
