import { PackageInfo, PackageVulnerability } from "../Package";
import { NpmPackage } from "../PackageLock";

const dividers: [number, string][] = [
  [1e12, "T"],
  [1e9, "G"],
  [1e6, "M"],
  [1e3, "K"],
];

export const addMetricSuffix = (number: number, suffix?: string) => {
  for (let i = 0; i < dividers.length; i++) {
    if (number >= dividers[i][0]) {
      return (number / dividers[i][0]).toFixed(2) + dividers[i][1] + (suffix ?? "");
    }
  }
  return number.toFixed(2) + (suffix ?? "");
};

export const calculateDownloadSize = (data?: Record<string, PackageInfo>) => {
  const size = Object.values(data ?? {}).reduce((acc, el) => acc + (el.unpackedSize ?? 0), 0);

  return addMetricSuffix(size, "B");
};

export const packageSizeMissing = (data?: Record<string, PackageInfo>) => {
  return (
    data &&
    Object.keys(data).length !== 0 &&
    Object.values(data).some((el) => !el.unpackedSize || el.unpackedSize === 0)
  );
};

export const getPackageNameAndVersion = ({
  tree,
  devTree,
}: {
  tree?: NpmPackage[];
  devTree?: NpmPackage[];
}): [string, string][] => [
  ...((tree ?? []).map((el) => [el.name ?? "", el.version ?? ""]) as [string, string][]),
  ...((devTree ?? []).map((el) => [el.name ?? "", el.version ?? ""]) as [string, string][]),
];

export const findWorstVuln = (vulns: Record<string, PackageVulnerability[]>) => {
  const text = Object.values(vulns).reduce(
    (acc, el) => {
      return el.reduce((acc2, vuln) => {
        if (!vuln.severity && acc[1] === "safe") return [0, "unknown"];
        if (!vuln.severity) return acc2;
        return (acc2[0] as number) >= vuln.severity?.score ? acc2 : [vuln.severity?.score, vuln.severity?.text];
      }, acc);
    },
    [0, "safe"],
  )[1] as string;

  return capitalizeFirst(text) as CVSSThreadLevel;
};

export type CVSSThreadLevel = "Low" | "Medium" | "High" | "Critical" | "Unknown";

export const getVulnCounts = (vulns: Record<string, PackageVulnerability[]>) => {
  return Object.values(vulns).reduce(
    (acc, vuln) => {
      vuln.forEach((vuln2) => {
        const key = capitalizeFirst(vuln2.severity?.text ?? "Unknown") as CVSSThreadLevel;
        acc[key] = (acc[key] ?? 0) + 1;
      });
      return acc;
    },
    {} as { [key in CVSSThreadLevel]: number | undefined },
  );
};

export const getVulnsCountText = (vulns: Record<string, PackageVulnerability[]>) => {
  const counts = getVulnCounts(vulns);
  return `There are currently ${counts.Critical ?? 0} Critical, ${counts.High ?? 0} High, ${
    counts.Medium ?? 0
  } Medium, ${counts.Low ?? 0} Low and ${counts.Unknown ?? 0} Unknown severity vulnerabilities`;
};

export const capitalizeFirst = (s: string) => {
  return s[0].toUpperCase() + s.slice(1);
};

export const calculateTotalDependencyCount = (dependencies: NpmPackage[]) => {
  return (
    dependencies.reduce((acc, dep) => {
      return acc + dep.totalDependencies;
    }, 0) + dependencies.length
  );
};

const severityOrder: { [key: string]: number } = {
  Critical: 0,
  High: 1,
  Medium: 2,
  Low: 3,
  Unknown: 4,
};

export const sortBySeverity = (vulns?: PackageVulnerability[]) =>
  [...(vulns ?? [])].sort(
    (vuln1, vuln2) =>
      severityOrder[vuln1.severity?.text ?? "Unknown"] - severityOrder[vuln2.severity?.text ?? "Unknown"],
  );
