import pLimit, { LimitFunction } from "p-limit";
import { z } from "zod";
import { DownloadHistory, downloadHistory, packageInfo, packageVulnerability } from "../Package";
import { withCache } from "./cache";
import { getNpmDateRange, getVulnerabilityScore, getVulnerabilitySeverity, getWeeklyDownloads } from "./utils";
import { Cache } from "cache-manager";

const npmPackageResponse = z.object({
  name: z.string(),
  version: z.string(),
  description: z.string().optional(),
  license: z.string().optional(),
  dist: z.object({ unpackedSize: z.number().optional() }),
  homepage: z.string().optional(),
  repository: z.object({ url: z.string() }).optional(),
});

const npmDownloadResponse = z.object({
  downloads: z.number(),
  start: z.string(),
  end: z.string(),
  package: z.string(),
});

export const npmDownloadsResponse = z.object({
  start: z.string(),
  end: z.string(),
  package: z.string(),
  downloads: z.array(
    z.object({
      downloads: z.number(),
      day: z.string(),
    }),
  ),
});

const osvVulnerabilityResponse = z.object({
  vulns: z
    .array(
      z
        .object({
          id: z.string(),
          summary: z.string(),
          details: z.string(),
          published: z.string(),
          modified: z.string(),
          references: z.array(
            z.object({
              type: z.string(),
              url: z.string(),
            }),
          ),
          affected: z.array(
            z.object({
              package: z.object({
                ecosystem: z.literal("npm"),
              }),
              ranges: z
                .array(
                  z.object({
                    type: z.literal("SEMVER"),
                    events: z.array(z.record(z.string(), z.string())),
                  }),
                )
                .optional(),
            }),
          ),
          severity: z.array(
            z.object({
              type: z.string(),
              score: z.string(),
            }),
          ),
        })
        .partial(),
    )
    .optional(),
});

export default class PackageInfoFetcher {
  private readonly limiter: LimitFunction;
  private readonly cache?: Cache;
  constructor(cache?: Cache) {
    this.limiter = pLimit(5);
    this.cache = cache;
  }

  async fetchPackageInfo(packageName: string, version: string) {
    return this.withCache(
      `package-info-${packageName}-${version}`,
      async () => {
        console.log(`Fetching package data for ${packageName} from NPM...`);

        const result = await this.safelyFetchJson(`https://registry.npmjs.org/${packageName}/${version}`);

        if (!result.ok) throw new Error(result.error);

        const data = npmPackageResponse.safeParse(result.data);

        if (!data.success) throw new Error(`Couldn't fetch package data for ${packageName}`);

        return data.data;
      },
      24 * 60 * 60,
    );
  }

  async fetchPackageDownloads(packageName: string) {
    return this.withCache(
      `package-downloads-${packageName}`,
      async () => {
        console.log(`Fetching package downloads for ${packageName} from NPM...`);
        const result = await this.safelyFetchJson(`https://api.npmjs.org/downloads/point/last-week/${packageName}`);

        if (!result.ok) throw new Error(result.error);

        const data = npmDownloadResponse.safeParse(result.data);

        if (!data.success) throw new Error(`Couldn't fetch package data for ${packageName}`);

        return data.data;
      },
      24 * 60 * 60,
    );
  }

  async fetchPackageDownloadHistory(packageName: string) {
    return this.withCache(
      `package-download-history-${packageName}`,
      async () => {
        console.log(`Fetching package download history for ${packageName} from NPM...`);
        const result = await this.safelyFetchJson(
          `https://api.npmjs.org/downloads/range/${getNpmDateRange(new Date())}/${packageName}`,
        );

        if (!result.ok) throw new Error(result.error);

        const data = npmDownloadsResponse.safeParse(result.data);

        if (!data.success) throw new Error(`Couldn't fetch download history for ${packageName}`);

        return data.data;
      },
      24 * 60 * 60,
    );
  }

  async fetchPackageVulnerabilities(packageName: string, version: string) {
    return this.withCache(
      `package-vulnerabilities-${packageName}-${version}`,
      async () => {
        console.log(`Fetching package vulnerabilities for ${packageName} from OSV...`);
        const result = await this.safelyFetchJson(`https://api.osv.dev/v1/query`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            version,
            package: {
              name: packageName,
            },
          }),
        });

        if (!result.ok) throw new Error(result.error);

        const data = osvVulnerabilityResponse.safeParse(result.data);

        if (!data.success) {
          console.log(data.error);
          throw new Error(`Couldn't fetch package data for ${packageName}`);
        }

        return data.data;
      },
      60 * 60,
    );
  }

  async getPackageDownloadHistory(packageName: string): Promise<DownloadHistory> {
    const downloads = await this.fetchPackageDownloadHistory(packageName);

    const data = downloadHistory.safeParse({
      ...downloads,
      downloads: getWeeklyDownloads(downloads),
    });

    if (!data.success) throw new Error(`Couldn't fetch download history for ${packageName}`);

    return data.data;
  }

  async getPackageInfo(packageName: string, version: string) {
    const [info, downloads] = await Promise.allSettled([
      this.fetchPackageInfo(packageName, version),
      this.fetchPackageDownloads(packageName),
    ]);

    const data = packageInfo.safeParse({
      ...(info.status === "fulfilled" ? info.value : {}),
      downloads: downloads.status === "fulfilled" ? downloads.value.downloads : undefined,
      unpackedSize: info.status === "fulfilled" ? info.value.dist.unpackedSize ?? 0 : undefined,
      repository: info.status === "fulfilled" ? info.value.repository?.url : undefined,
    });

    if (!data.success) throw new Error(`Couldn't fetch package data for ${packageName}`);

    return data.data;
  }

  async getPackageVulnerabilities(packageName: string, version: string) {
    const vulnerabilities = await this.fetchPackageVulnerabilities(packageName, version);

    const data = (vulnerabilities?.vulns ?? []).map((vuln) => {
      const severityResult = vuln.severity?.find((el) => el.type?.includes("CVSS"))?.score;

      const severity = severityResult
        ? {
            score: getVulnerabilityScore(severityResult),
            text: getVulnerabilitySeverity(severityResult),
            vector: severityResult,
          }
        : undefined;

      return packageVulnerability.parse({
        name: packageName,
        version,
        ...vuln,
        from: (((vuln.affected ?? [])[0].ranges ?? [])[0]?.events?.find((el) =>
          Object.keys(el).includes("introduced"),
        ) ?? {})["introduced"],
        to: (((vuln.affected ?? [])[0].ranges ?? [])[0]?.events?.find((el) => Object.keys(el).includes("fixed")) ?? {})[
          "fixed"
        ],
        severity,
      });
    });

    return data;
  }

  async safelyFetchJson<T>(
    url: string,
    init?: RequestInit,
  ): Promise<{ ok: false; error: string } | { ok: true; data: T }> {
    const result = await this.limitedFetch(url, init);

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

  async limitedFetch(url: string, init?: RequestInit) {
    return await this.limiter(() => fetch(url, init));
  }

  async withCache<T>(key: string, func: () => Promise<T>, ttl: number = 60 * 60) {
    return withCache(this.cache, key, func, ttl);
  }
}
