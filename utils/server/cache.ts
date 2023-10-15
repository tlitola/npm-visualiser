import fsStore from "cache-manager-fs-hash";
import { caching, Cache } from "cache-manager";
import { RedisStore, redisStore } from "cache-manager-redis-yet";
import { RedisClientType } from "redis";

export type AppCache = RedisStore<RedisClientType> | Cache;

export const initializeCache = async () => {
  const ttl = 1000 * 60;

  const cache = process.env.REDIS_URL
    ? await redisStore({ url: process.env.REDIS_URL, ttl })
    : await caching({
        store: fsStore,
        options: {
          path: process.env.CACHE_DIR ?? "cache",
          ttl,
        },
      });

  return cache;
};

export const disconnectCache = async (cache: RedisStore | Cache | undefined) => {
  //@ts-expect-error Cache has client only if it's of type RedisStore
  if (cache?.client) {
    await (cache as RedisStore).client.disconnect();
  }
};

export const withCache = async <T>(
  cache: AppCache | undefined,
  key: string,
  func: () => Promise<T>,
  ttl: number = 1000 * 60,
) => {
  if (!cache) return func();

  const cachedResult = await cache.get<T>(key);
  if (cachedResult) return cachedResult;

  const result = await func();
  await cache.set(key, result, ttl);
  return result;
};

export const handleWithCache = async <Response>(func: (cache: AppCache) => Response): Promise<Response> => {
  const cache = await initializeCache();

  try {
    return func(cache);
  } finally {
    await disconnectCache(cache);
  }
};
