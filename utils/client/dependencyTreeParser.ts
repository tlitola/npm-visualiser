import { LockFilePackage, NpmPackage, PackageLock, npmPackage } from "../PackageLock";

import omit from "lodash.omit";

export const createDependencyGraph = (
  lockfile: PackageLock,
  type: "dependencies" | "devDependencies" = "dependencies",
  updateStatus?: (dependencyNumber: number, name: string, subPackageName?: string) => void,
) => {
  let dependencyList;

  switch (type) {
    case "dependencies":
      dependencyList = lockfile.packages[""].dependencies ?? {};
      break;
    case "devDependencies":
      dependencyList = lockfile.packages[""].devDependencies ?? {};
      break;
  }

  const dependencies: NpmPackage[] = Object.keys(dependencyList).map((packageName, i) => {
    updateStatus && updateStatus(i + 1, packageName);
    return {
      name: packageName,
      ...findDependencies(
        lockfile,
        "node_modules" + "/" + packageName,
        lockfile.packages["node_modules/" + packageName],
        packageName,
        [packageName],
        new Map(),
      ),
    };
  });
  return dependencies;
};

const getDependency = (lockfile: PackageLock, path: string, dependency: string) => {
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
  name: string,
  stack: string[],
  dp: Map<string, NpmPackage>,
): NpmPackage => {
  if (dp.has(`${name}-${dependency.version}`)) {
    return dp.get(`${name}-${dependency.version}`) as NpmPackage;
  }

  const new_dependency = npmPackage.parse(omit({ ...dependency, name, totalDependencies: 0 }, ["dependencies"]));

  const dependencies = Object.keys(dependency.dependencies ?? {}).map((dependencyName) => {
    if (stack.includes(dependencyName))
      return {
        name: dependencyName,
        cyclic: true,
        ...npmPackage.parse(
          omit(
            {
              ...getDependency(lockfile, path, dependencyName),
              totalDependencies: 0,
            },
            ["dependencies"],
          ),
        ),
      };

    return {
      name: dependencyName,
      ...findDependencies(
        lockfile,
        getPath(lockfile, path, dependencyName),
        getDependency(lockfile, path, dependencyName),
        dependencyName,
        [...stack, dependencyName],
        dp,
      ),
    };
  });

  new_dependency["dependencies"] = dependencies;
  new_dependency["totalDependencies"] = calculateFullDependencyCount(new_dependency);

  dp.set(`${new_dependency.name}-${new_dependency.version}`, new_dependency);

  return new_dependency;
};

const calculateFullDependencyCount = (dependency: NpmPackage) => {
  return (
    (dependency.dependencies?.reduce((acc, el) => acc + (el.totalDependencies ?? 0), 0) ?? 0) +
    (dependency.dependencies?.length ?? 0)
  );
};
