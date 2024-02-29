import { z } from "zod";
import { PackageInfo, PackageVulnerability, downloadHistory, packageInfo, packageVulnerability } from "../Package";
import { DepGraph } from "dependency-graph";
import { NpmPackage } from "@/utils/PackageLock";

const { signal } = new AbortController();

export const fetchDependencyInfo = async (name: string, version: string): Promise<PackageInfo> => {
  const result = await fetch(`/api/dependency/${name}/${version}`, { signal });
  return packageInfo.parse(await result.json());
};

export const fetchDownloadsHistory = async (name: string) => {
  const result = await fetch(`/api/download_history/${name}`, { signal });
  return downloadHistory.parse(await result.json());
};

export const fetchAllDependenciesInfo = async (
  graph: DepGraph<NpmPackage>,
): Promise<Record<string, PackageInfo> | undefined> => {
  const dependencies = Object.values(graph.nodes);
  if (dependencies.length === 0) return undefined;
  const result = await Promise.all(
    dependencies.map(async (dep) => {
      return { [dep.integrity]: await fetchDependencyInfo(dep.name ?? "", dep.version ?? "") };
    }),
  );

  return result.reduce((acc, el) => {
    return { ...acc, ...el };
  }, {});
};

export const fetchDependencyVulnerabilities = async (
  name: string,
  version: string,
): Promise<PackageVulnerability[]> => {
  const result = await fetch(`/api/dependency/vulnerabilities/${name}/${version}`);
  const data = await result.json();
  return z.array(packageVulnerability).parse(data);
};

export const fetchAllDependenciesVulnerabilities = async (
  graph: DepGraph<NpmPackage>,
): Promise<Record<string, PackageVulnerability[]> | undefined> => {
  const dependencies = Object.values(graph.nodes);
  if (dependencies.length === 0) return undefined;

  const result = await Promise.all(
    dependencies.map(async (dependency) => {
      return {
        [dependency.integrity]: await fetchDependencyVulnerabilities(dependency.name ?? "", dependency.version),
      };
    }),
  );

  return result.reduce((acc, el) => {
    return Object.values(el)[0].length > 0 ? { ...acc, ...el } : acc;
  }, {});
};
