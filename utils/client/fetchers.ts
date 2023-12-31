import { z } from "zod";
import { PackageInfo, PackageVulnerability, downloadHistory, packageInfo, packageVulnerability } from "../Package";

const { signal } = new AbortController();

export const fetchPackageInfo = async (name: string, version: string): Promise<PackageInfo> => {
  const result = await fetch(`/api/dependency/${name}/${version}`, { signal });
  return packageInfo.parse(await result.json());
};

export const fetchDownloadsHistory = async (name: string) => {
  const result = await fetch(`/api/download_history/${name}`, { signal });
  return downloadHistory.parse(await result.json());
};

export const fetchAllPackagesInfo = async (
  packages: [string, string][],
): Promise<Record<string, PackageInfo> | undefined> => {
  if (packages.length === 0) return undefined;
  const result = await Promise.all(
    packages.map(async (el) => {
      const [name, version] = el;

      return { [`${name}@${version}`]: await fetchPackageInfo(name, version) };
    }),
  );

  return result.reduce((acc, el) => {
    return { ...acc, ...el };
  }, {});
};

export const fetchPackageVulnerabilities = async (name: string, version: string): Promise<PackageVulnerability[]> => {
  const result = await fetch(`/api/dependency/vulnerabilities/${name}/${version}`);
  const data = await result.json();
  return z.array(packageVulnerability).parse(data);
};

export const fetchAllPackagesVulnerabilites = async (
  packages: [string, string][],
): Promise<Record<string, PackageVulnerability[]> | undefined> => {
  if (packages.length === 0) return undefined;
  const result = await Promise.all(
    packages.map(async (el) => {
      const [name, version] = el;

      return {
        [`${name}@${version}`]: await fetchPackageVulnerabilities(name, version),
      };
    }),
  );

  return result.reduce((acc, el) => {
    return Object.values(el)[0].length > 0 ? { ...acc, ...el } : acc;
  }, {});
};
