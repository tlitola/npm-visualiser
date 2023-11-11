import { PackageLock } from "../PackageLock";
import { createDependencyTree } from "./dependencyTreeParser";
import { LoadingStatusUpdate, ParseCompleteMessage } from "../protocol";

self.onmessage = async (e: MessageEvent<[string, PackageLock]>) => {
  switch (e.data[0]) {
    case "generate":
      const result = e.data[1];

      const dependencyCount = Object.keys(result.packages[""].dependencies ?? {}).length;
      const tree = createDependencyTree(result, "dependencies", (dependencyNumber, dependencyName) => {
        self.postMessage([
          "loadingStatus",
          [
            0,
            (dependencyNumber / dependencyCount) * 100,
            `${dependencyNumber}/${dependencyCount}: ${dependencyName}`,
          ] satisfies LoadingStatusUpdate,
        ]);
      });

      //Rest to allow the loading animation time to catch up
      dependencyCount > 0 && (await new Promise((resolve) => setTimeout(() => resolve(""), 1000)));

      const devDependencyCount = Object.keys(result.packages[""].devDependencies ?? {}).length;
      const devTree = createDependencyTree(result, "devDependencies", (dependencyNumber, dependencyName) => {
        self.postMessage([
          "loadingStatus",
          [
            1,
            (dependencyNumber / devDependencyCount) * 100,
            `${dependencyNumber}/${devDependencyCount}: ${dependencyName}`,
          ] satisfies LoadingStatusUpdate,
        ]);
      });

      //Rest to allow the loading animation time to catch up
      devDependencyCount > 0 && (await new Promise((resolve) => setTimeout(() => resolve(""), 1000)));

      self.postMessage([
        "complete",
        [tree, devTree, Object.keys(result.packages).length - 1] satisfies ParseCompleteMessage,
      ]);
      break;

    default:
      break;
  }
};

export {};
