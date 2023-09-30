import { PackageInfo } from "../Package";
import { NpmPackage } from "../PackageLock";

const dividers: [number, string][] = [
  [1e12, "T"],
  [1e9, "G"],
  [1e6, "M"],
  [1e3, "K"],
];

const addMetricSuffix = (number: number, suffix?: string) => {
  for (let i = 0; i < dividers.length; i++) {
    if (number >= dividers[i][0]) {
      return (number / dividers[i][0]).toFixed(2) + dividers[i][1] + suffix;
    }
  }
  return number.toFixed(2) + suffix;
};

export const calculateDownloadSize = (data?: Record<string, PackageInfo>) => {
  const size = Object.values(data ?? {}).reduce(
    (acc, el) => acc + (el.unpackedSize ?? 0),
    0
  );

  return addMetricSuffix(size, "B");
};

export const packageSizeMissing = (data?: Record<string, PackageInfo>) => {
  return (
    data &&
    Object.keys(data).length !== 0 &&
    Object.values(data).some((el) => el.unpackedSize === 0)
  );
};

export const getPackageNameAndVersion = ({
  tree,
  peerTree,
  devTree,
}: {
  tree: NpmPackage[];
  devTree: NpmPackage[];
  peerTree: NpmPackage[];
}): [string, string][] => [
  ...(tree.map((el) => [el.name ?? "", el.version ?? ""]) as [
    string,
    string
  ][]),
  ...(devTree.map((el) => [el.name ?? "", el.version ?? ""]) as [
    string,
    string
  ][]),
  ...(peerTree.map((el) => [el.name ?? "", el.version ?? ""]) as [
    string,
    string
  ][]),
];
