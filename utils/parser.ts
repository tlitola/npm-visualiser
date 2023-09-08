import {
  LockFilePackage,
  NpmPackage,
  PackageLock,
  npmPackage,
} from "./PackageLock";

import omit from "lodash.omit";

export const createDependencyTree = (
  lockfile: PackageLock,
  type:
    | "dependencies"
    | "devDependencies"
    | "peerDependencies" = "dependencies",
  updateStatus?: (
    dependencyNumber: number,
    name: string,
    subPackageName?: string
  ) => void
) => {
  let dependencyList;

  switch (type) {
    case "dependencies":
      dependencyList = lockfile.packages[""].dependencies;
      break;
    case "devDependencies":
      dependencyList = lockfile.packages[""].devDependencies ?? {};
      break;
    case "peerDependencies":
      dependencyList = lockfile.packages[""].peerDependencies ?? {};
      break;
  }

  const dependencies: NpmPackage[] = Object.keys(dependencyList).map(
    (packageName, i) => {
      updateStatus && updateStatus(i + 1, packageName);
      return {
        name: packageName,
        ...findDependencies(
          lockfile,
          "node_modules" + "/" + packageName,
          lockfile.packages["node_modules/" + packageName],
          [packageName]
        ),
      };
    }
  );
  return dependencies;
};

const getDependency = (
  lockfile: PackageLock,
  path: string,
  dependency: string
) => {
  if (Object.hasOwn(lockfile.packages, path + "/node_modules/" + dependency)) {
    return lockfile.packages[path + "/node_modules/" + dependency];
  }
  return lockfile.packages["node_modules/" + dependency];
};

const getPath = (lockfile: PackageLock, path: string, dependency: string) => {
  if (Object.hasOwn(lockfile.packages, path + "/node_modules/" + dependency)) {
    return path + "/node_modules/" + dependency;
  }
  return "node_modules/" + dependency;
};

const findDependencies = (
  lockfile: PackageLock,
  path: string,
  dependency: LockFilePackage,
  stack: string[]
): NpmPackage => {
  const new_dependency = npmPackage.parse(
    omit(dependency, ["dependencies", "peerDependencies"])
  );

  const dependencies = Object.keys(dependency.dependencies ?? {}).map(
    (dependencyName) => {
      if (stack.includes(dependencyName))
        return {
          name: dependencyName,
          cyclic: true,
          ...npmPackage.parse(
            omit(getDependency(lockfile, path, dependencyName), [
              "dependencies",
              "peerDependencies",
            ])
          ),
        };

      return {
        name: dependencyName,
        ...findDependencies(
          lockfile,
          getPath(lockfile, path, dependencyName),
          getDependency(lockfile, path, dependencyName),
          [...stack, dependencyName]
        ),
      };
    }
  );

  const peerDependencies = Object.keys(dependency.peerDependencies ?? {})
    .filter((name) =>
      Object.hasOwn(lockfile.packages, getPath(lockfile, path, name))
    )
    .map((dependencyName) => {
      if (stack.includes(dependencyName))
        return {
          name: dependencyName,
          cyclic: true,
          ...npmPackage.parse(
            omit(getDependency(lockfile, path, dependencyName), [
              "dependencies",
              "peerDependencies",
            ])
          ),
        };

      return {
        name: dependencyName,
        ...findDependencies(
          lockfile,
          getPath(lockfile, path, dependencyName),
          getDependency(lockfile, path, dependencyName),
          [...stack, dependencyName]
        ),
      };
    });

  new_dependency["dependencies"] = dependencies;
  new_dependency["peerDependencies"] = peerDependencies;

  return new_dependency;
};
