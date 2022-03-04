import { Method } from './Fetch';

export interface CacheStore {
  cache: Record<Method, Record<string, any>>;
}
