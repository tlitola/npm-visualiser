import fsStore from "cache-manager-fs-hash";
import { caching, Cache } from "cache-manager";
import { RedisStore, redisStore } from "cache-manager-redis-yet";

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

export const disconnectCache = (cache: RedisStore | Cache | undefined) => {
  //@ts-ignore
  if (cache?.client) {
    (cache as RedisStore).client.disconnect();
  }
};

export const withCache = async <T>(
  cache: Cache | RedisStore | undefined,
  key: string,
  func: () => Promise<T>,
  ttl: number = 1000 * 60
) => {
  if (!cache) return func();

  const cachedResult = await cache.get<T>(key);
  if (cachedResult) return cachedResult;

  const result = await func();
  await cache.set(key, result, ttl);
  return result;
};
