import pLimit, { LimitFunction } from "p-limit";
import { z } from "zod";
import { packageInfo } from "../Package";
import { Cache } from "cache-manager";
import { withCache } from "./cache";
import { RedisStore } from "cache-manager-redis-yet";

const npmPackageResponse = z.object({
  name: z.string(),
  version: z.string(),
  description: z.string().optional(),
  license: z.string().optional(),
  dist: z.object({ unpackedSize: z.number().optional() }),
});

const npmDownloadResponse = z.object({
  downloads: z.number(),
  start: z.string(),
  end: z.string(),
  package: z.string(),
});

export default class PackageInfoFetcher {
  private readonly limiter: LimitFunction;
  private readonly cache: RedisStore | Cache | undefined;
  constructor(cache: RedisStore | Cache | undefined) {
    this.limiter = pLimit(5);
    this.cache = cache;
  }

  async fetchPackageInfo(packageName: string, version: string) {
    return this.withCache(
      `package-info-${packageName}-${version}`,
      async () => {
        console.log(`Fetching package data for ${packageName} from NPM...`);

        const result = await this.safelyFetchJson(
          `https://registry.npmjs.org/${packageName}/${version}`
        );

        if (!result.ok) throw new Error(result.error);

        const data = npmPackageResponse.safeParse(result.data);

        if (!data.success)
          throw new Error(`Couldn't fetch package data for ${packageName}`);

        return data.data;
      },
      1000 * 60 * 60
    );
  }

  async fetchPackageDownloads(packageName: string) {
    return this.withCache(
      `package-downloads-${packageName}`,
      async () => {
        console.log(
          `Fetching package downloads for ${packageName} from NPM...`
        );
        const result = await this.safelyFetchJson(
          `https://api.npmjs.org/downloads/point/last-month/${packageName}`
        );

        if (!result.ok) throw new Error(result.error);

        const data = npmDownloadResponse.safeParse(result.data);

        if (!data.success)
          throw new Error(`Couldn't fetch package data for ${packageName}`);

        return data.data;
      },
      1000 * 60 * 60
    );
  }

  async getPackageInfo(packageName: string, version: string) {
    const [info, downloads] = await Promise.allSettled([
      this.fetchPackageInfo(packageName, version),
      this.fetchPackageDownloads(packageName),
    ]);

    const data = packageInfo.safeParse({
      ...(info.status === "fulfilled" ? info.value : {}),
      downloads:
        downloads.status === "fulfilled"
          ? downloads.value.downloads
          : undefined,
      unpackedSize:
        info.status === "fulfilled"
          ? info.value.dist.unpackedSize ?? 0
          : undefined,
    });

    if (!data.success)
      throw new Error(`Couldn't fetch package data for ${packageName}`);

    return data.data;
  }

  async safelyFetchJson<T>(
    url: string
  ): Promise<{ ok: false; error: string } | { ok: true; data: T }> {
    const result = await this.limitedFetch(url);

    if (!result.ok)
      return {
        ok: false,
        error: `Couldn't fetch from ${url}. The server responded with status ${result.status}`,
      };

    try {
      const data = (await result.json()) as T;
      return { ok: true, data };
    } catch (error) {
      return { ok: false, error: "Couldn't parse the JSON file" };
    }
  }

  async limitedFetch(url: string) {
    return await this.limiter(() => fetch(url));
  }

  async withCache<T>(
    key: string,
    func: () => Promise<T>,
    ttl: number = 1000 * 60
  ) {
    return withCache(this.cache, key, func, ttl);
  }
}
