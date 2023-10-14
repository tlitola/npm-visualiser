import { PackageInfo } from "@/utils/Package";
import { NpmPackage } from "@/utils/PackageLock";
import { Factory } from "fishery";

export const PackageInfoFactory = Factory.define<PackageInfo>(({ sequence }) => ({
  name: "Name " + sequence,
  version: sequence.toString(),
  description: "Description" + sequence.toString(),
  license: "License" + sequence,
  unpackedSize: sequence,
  downloads: sequence,
  homepage: "Home" + sequence,
  repository: "Repository" + sequence,
}));

export const buildPackageInfoRecord = (...packages: PackageInfo[]) =>
  packages.reduce(
    (acc, p) => {
      acc[p.name + "@" + p.version] = p;
      return acc;
    },
    {} as Record<string, PackageInfo>,
  );

export const PackageFactory = Factory.define<NpmPackage>(({ sequence }) => ({
  name: "Name " + sequence,
  version: sequence.toString(),
  totalDependencies: sequence,
  dependencies: [],
  devDependencies: [],
}));
