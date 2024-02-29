import { NpmPackage, PackageLock, npmPackage } from "../PackageLock";
import { DepGraph } from "dependency-graph";

import omit from "lodash.omit";

export const createDependencyGraph = (lockfile: PackageLock): DepGraph<NpmPackage> => {
  let dependencies = Object.keys(omit(lockfile.packages, ""));

  const graph = new DepGraph<NpmPackage>({ circular: true });

  //Add nodes to the graph excluding optional peer-dependencies
  dependencies.forEach((key) => {
    if (lockfile.packages[key].peer === true && lockfile.packages[key].optional === true) {
      dependencies = dependencies.filter((el) => el !== key);
    } else {
      graph.addNode(
        key.replaceAll("node_modules/", ""),
        npmPackage.parse({ ...lockfile.packages[key], name: key.split("node_modules/").at(-1) }),
      );
    }
  });

  //Add edges to the graph
  dependencies.forEach((key) => {
    const dep = lockfile.packages[key];
    const graphKey = key.replaceAll("node_modules/", "");
    Object.keys(dep.dependencies ?? {}).forEach((depKey) => {
      graph.addDependency(graphKey, getPath(lockfile, key, depKey).replaceAll("node_modules/", ""));
    });
  });
  dependencies.forEach((key) => {
    const graphKey = key.replaceAll("node_modules/", "");
    //Remove nodes that don't have any edges and are not direct dependencies
    if (graph.dependantsOf(graphKey).length === 0 && graph.dependenciesOf(graphKey).length === 0) {
      if (
        !Object.keys(lockfile.packages[""].dependencies ?? {}).includes(graphKey) &&
        !Object.keys(lockfile.packages[""].devDependencies ?? {}).includes(graphKey)
      ) {
        graph.removeNode(graphKey);
      }
    }
  });
  return graph;
};

/**
 * Finds the path of a dependency in the lockfile
 * @param {PackageLock} lockfile
 * @param {string} currentPath Tells which dependency given dependency depends on, eg. node_modules/@babel/highlight
 * @param {string} dependencyName The name of dependency to look for, eg. chalk
 * @returns {string} The path of dependency in the lockfile, eg. node_modules/@babel/highlight/node_modules/chalk
 */
const getPath = (lockfile: PackageLock, currentPath: string, dependencyName: string) => {
  if (Object.hasOwn(lockfile.packages, currentPath + "/node_modules/" + dependencyName)) {
    return currentPath + "/node_modules/" + dependencyName;
  } else if (
    Object.hasOwn(
      lockfile.packages,
      currentPath.replace(currentPath.split("node_modules/").at(-1) as string, dependencyName),
    )
  ) {
    return currentPath.replace(currentPath.split("node_modules/").at(-1) as string, dependencyName);
  }
  return "node_modules/" + dependencyName;
};
