import { PackageInfo, PackageVulnerability } from "../Package";
import { NpmPackage } from "../PackageLock";
import { DepGraph } from "dependency-graph";
import { CVSSThreadLevel, ThreadLevels, VULNERABILITY_SEVERITY_ORDER } from "@/utils/constants/constants";

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

export const calculateDownloadSize = (data: Record<string, PackageInfo>) => {
  const size = Object.values(data).reduce((acc, el) => acc + (el.unpackedSize ?? 0), 0);

  return addMetricSuffix(size, "B");
};

export const packageSizeMissing = (data: Record<string, PackageInfo>) => {
  return Object.keys(data).length !== 0 && Object.values(data).some((el) => !el.unpackedSize || el.unpackedSize === 0);
};

export const getChildrenVulnerabilities = (
  graphKey: string,
  graph: DepGraph<NpmPackage>,
  vulns: Record<string, PackageVulnerability[]>,
) => {
  const children = graph.dependenciesOf(graphKey);
  const dep = graph.getNodeData(graphKey);

  const childrenVulns: Record<string, PackageVulnerability[]> = {};

  children.forEach((el) => {
    const child = graph.getNodeData(el);
    if (dep.integrity !== child.integrity && Object.hasOwn(vulns, child.integrity)) {
      childrenVulns[child.integrity] = vulns[child.integrity];
    }
  });
  return childrenVulns;
};

export const findWorstVulnerability = (vulns: Record<string, PackageVulnerability[]>): string => {
  const text = Object.values(vulns).reduce(
    (acc, el) => {
      return el.reduce((acc2, vuln) => {
        if (!vuln.severity && acc[1] === ThreadLevels.Safe)
          return [0, ThreadLevels.Unknown] as [number, CVSSThreadLevel];
        if (!vuln.severity) return acc2;
        return (acc2[0] as number) >= vuln.severity?.score
          ? acc2
          : ([vuln.severity?.score, vuln.severity?.text] as [number, CVSSThreadLevel]);
      }, acc);
    },
    [0, ThreadLevels.Safe] as [number, CVSSThreadLevel],
  )[1];

  return (Object.values(ThreadLevels) as string[]).includes(text)
    ? capitalizeFirst(text)
    : capitalizeFirst(ThreadLevels.Unknown);
};

export const getVulnerabilityCount = (vulns: Record<string, PackageVulnerability[]>) => {
  return Object.values(vulns).reduce((acc, vuln) => acc + vuln.length, 0);
};

export const getVulnerabilitySeverities = (vulns: Record<string, PackageVulnerability[]>) => {
  return Object.values(vulns).reduce(
    (acc, vuln) => {
      vuln.forEach((vuln2) => {
        const key = vuln2.severity?.text ?? ThreadLevels.Unknown;
        acc[key] = (acc[key] ?? 0) + 1;
      });
      return acc;
    },
    {} as { [key in CVSSThreadLevel]: number | undefined },
  );
};

export const getVulnerabilityCountText = (vulns: Record<string, PackageVulnerability[]>) => {
  const counts = getVulnerabilitySeverities(vulns);
  return `There are currently ${counts.critical ?? 0} Critical, ${counts.high ?? 0} High, ${
    counts.medium ?? 0
  } Medium, ${counts.low ?? 0} Low and ${counts.unknown ?? 0} Unknown severity vulnerabilities`;
};

export const capitalizeFirst = <TString extends string>(s: TString) => {
  return s[0].toUpperCase() + s.slice(1);
};

export const sortBySeverity = (vulns: PackageVulnerability[]) => {
  return [...(vulns ?? [])].sort(
    (vuln1, vuln2) =>
      VULNERABILITY_SEVERITY_ORDER[vuln1.severity?.text ?? ThreadLevels.Unknown] -
      VULNERABILITY_SEVERITY_ORDER[vuln2.severity?.text ?? ThreadLevels.Unknown],
  );
};
