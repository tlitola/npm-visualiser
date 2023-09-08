import { PackageLock } from "./PackageLock";
import { createDependencyTree } from "./parser";

self.onmessage = async (e: MessageEvent<[string, any]>) => {
  switch (e.data[0]) {
    case "generate":
      const result = PackageLock.safeParse(e.data[1]);

      if (!result.success) {
        console.log(result.error.toString());
        throw new Error(
          "Please make sure your package-lock file follows the standard of lockfile version 3"
        );
      }

      const dependencyCount = Object.keys(
        result.data.packages[""].dependencies
      ).length;
      const tree = createDependencyTree(
        result.data,
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
        result.data.packages[""].devDependencies ?? {}
      ).length;
      const devTree = createDependencyTree(
        result.data,
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
        result.data.packages[""].peerDependencies ?? {}
      ).length;
      const peerTree = createDependencyTree(
        result.data,
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
