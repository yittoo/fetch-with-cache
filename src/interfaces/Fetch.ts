export interface BaseFetch {}

export type RequestOptions<T = void> = Omit<RequestInit, 'options'> & {
  body: T;
};

export type Method = 'GET' | 'HEAD' | 'POST' | 'CONNECT' | 'TRACE' | 'TRACK' | 'DELETE' | 'OPTIONS' | 'PUT';

export enum CachePolicy {
  cacheFirst = 'cache-first',
  cacheOnly = 'cache-only',
  networkOnly = 'network-only',
  noCache = 'no-cache',
}

export interface FetchCustomOptions {
  cachePolicy: CachePolicy;
  onSuccess: <R = unknown>(res: Response) => R;
  onError: <E = unknown>(res: Response) => E;
}
