import { z } from "zod";
import { PackageLock } from "./PackageLock";
import { createDependencyTree } from "./dependencyTreeParser";

self.onmessage = async (e: MessageEvent<[string, any]>) => {
  switch (e.data[0]) {
    case "generate":
      const result = e.data[1] as z.infer<typeof PackageLock>;

      const dependencyCount = Object.keys(
        result.packages[""].dependencies ?? {}
      ).length;
      const tree = createDependencyTree(
        result,
        "dependencies",
        (dependencyNumber, dependencyName) => {
          self.postMessage([
            "loadingStatus",
            [
              0,
              (dependencyNumber / dependencyCount) * 100,
              `${dependencyNumber}/${dependencyCount}: ${dependencyName}`,
            ],
          ]);
        }
      );

      //Rest to allow the loading animation time to catch up
      await new Promise((resolve) => setTimeout(() => resolve(""), 1000));

      const devDependencyCount = Object.keys(
        result.packages[""].devDependencies ?? {}
      ).length;
      const devTree = createDependencyTree(
        result,
        "devDependencies",
        (dependencyNumber, dependencyName) => {
          self.postMessage([
            "loadingStatus",
            [
              1,
              (dependencyNumber / devDependencyCount) * 100,
              `${dependencyNumber}/${devDependencyCount}: ${dependencyName}`,
            ],
          ]);
        }
      );

      //Rest to allow the loading animation time to catch up
      await new Promise((resolve) => setTimeout(() => resolve(""), 1000));

      const peerDependencyCount = Object.keys(
        result.packages[""].peerDependencies ?? {}
      ).length;
      const peerTree = createDependencyTree(
        result,
        "peerDependencies",
        (dependencyNumber, dependencyName) => {
          self.postMessage([
            "loadingStatus",
            [
              2,
              (dependencyNumber / peerDependencyCount) * 100,
              `${dependencyNumber}/${peerDependencyCount}: ${dependencyName}`,
            ],
          ]);
        }
      );

      self.postMessage(["complete", [tree, devTree, peerTree]]);
      break;

    default:
      break;
  }
};

export {};
