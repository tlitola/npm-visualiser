import { z } from "zod";
import { downloadHistory, packageInfo, packageVulnerability } from "../Package";

export const fetchPackageInfo = async (name: string, version: string) => {
  const result = await fetch(`/api/dependency/${name}/${version}`);
  return packageInfo.parse(await result.json());
};

export const fetchDownloadsHistory = async (name: string) => {
  const result = await fetch(`/api/download_history/${name}`);
  return downloadHistory.parse(await result.json());
};

export const fetchAllPackagesInfo = async (packages: [string, string][]) => {
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

export const fetchPackageVulnerabies = async (name: string, version: string) => {
  const result = await fetch(`/api/dependency/vulnerabilities/${name}/${version}`);
  const data = await result.json();
  return z.array(packageVulnerability).parse(data);
};

export const fetchAllPackagesVulnerabilites = async (packages: [string, string][]) => {
  if (packages.length === 0) return undefined;
  const result = await Promise.all(
    packages.map(async (el) => {
      const [name, version] = el;

      return {
        [`${name}@${version}`]: await fetchPackageVulnerabies(name, version),
      };
    }),
  );

  return result.reduce((acc, el) => {
    return Object.values(el)[0].length > 0 ? { ...acc, ...el } : acc;
  }, {});
};
