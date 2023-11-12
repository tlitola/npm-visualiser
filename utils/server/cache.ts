import { caching, Cache } from "cache-manager";
import fsStore from "cache-manager-fs-hash";
import redisStore from "cache-manager-redis-store";

export const initializeCache = async (): Promise<Cache> => {
  const cache = process.env.REDIS_URL
    ? await caching({
        store: redisStore,
        url: process.env.REDIS_URL,
      })
    : await caching({
        store: fsStore,
        options: {
          path: process.env.CACHE_DIR ?? "cache",
        },
      });

  return cache;
};

export const disconnectCache = async (cache: Cache | undefined) => {
  //@ts-expect-error Getclient exists if store is redisstore
  cache?.store.getClient && cache?.store.getClient().quit();
};

export const withCache = async <T>(
  cache: Cache | undefined,
  key: string,
  func: () => Promise<T>,
  ttl: number = 60 * 60,
) => {
  if (!cache) return func();

  const cachedResult = await cache.get<T>(key);
  if (cachedResult) return cachedResult;

  const result = await func();
  await cache.set(key, result, { ttl });
  return result;
};

export const handleWithCache = async <Response>(func: (cache: Cache) => Response): Promise<Response> => {
  const cache = await initializeCache();

  try {
    return await func(cache);
  } finally {
    await disconnectCache(cache);
  }
};
