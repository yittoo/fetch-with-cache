import { Method } from './Fetch';

export interface CacheStore {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cache: Record<Method, Record<string, any>>;
}
