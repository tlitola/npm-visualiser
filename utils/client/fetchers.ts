import { z } from "zod";
import { PackageInfo, PackageVulnerability, downloadHistory, packageInfo, packageVulnerability } from "../Package";
import { DepGraph } from "dependency-graph";
import { NpmPackage } from "@/utils/PackageLock";

const { signal } = new AbortController();

export const fetchDownloadsHistory = async (name: string) => {
  const result = await fetch(`/api/download_history/${name}`, { signal });
  return downloadHistory.parse(await result.json());
};

export const fetchAllDependenciesInfo = async (
  graph: DepGraph<NpmPackage>,
): Promise<Record<string, PackageInfo> | undefined> => {
  const dependencies = Object.values(graph.nodes);
  if (dependencies.length === 0) return undefined;
  const dependenciesString = getDependencyString(dependencies);

  const result = z
    .object({
      missing: z.array(z.string()),
      data: z.record(z.string(), packageInfo),
    })
    .parse(await (await fetch(`/api/dependency?dependencies=${dependenciesString}`, { signal })).json());

  return Object.entries(result.data).reduce((acc: Record<string, PackageInfo>, el) => {
    const [key, value] = el;
    const dependency = dependencies.find((dep) => key === `${dep.name}:${dep.version}`);
    if (!dependency) return acc;
    acc[dependency.integrity] = value;
    return acc;
  }, {});
};

export const fetchVulnerabilities = async (
  graph: DepGraph<NpmPackage>,
): Promise<Record<string, PackageVulnerability[]> | undefined> => {
  const dependencies = Object.values(graph.nodes);
  if (dependencies.length === 0) return undefined;
  const dependenciesString = getDependencyString(dependencies);

  const result = z
    .object({
      missing: z.array(z.string()),
      data: z.record(z.string(), z.array(packageVulnerability)),
    })
    .parse(
      await (await fetch(`/api/dependency/vulnerabilities?dependencies=${dependenciesString}`, { signal })).json(),
    );

  return Object.entries(result.data).reduce((acc: Record<string, PackageVulnerability[]>, el) => {
    const [key, value] = el;
    const dependency = dependencies.find((dep) => key === `${dep.name}:${dep.version}`);
    if (!dependency) return acc;
    if (value.length === 0) return acc;
    acc[dependency.integrity] = value;
    return acc;
  }, {});
};

const getDependencyString = (dependencies: NpmPackage[]) =>
  dependencies.map((dep) => `${dep.name}:${dep.version}`).join(",");
