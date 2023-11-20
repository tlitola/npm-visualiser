import { PackageLock } from "../PackageLock";
import { createDependencyGraph } from "./dependencyTreeParser";
import { LoadingStatusUpdate, ParseCompleteMessage } from "../protocol";

self.onmessage = async (e: MessageEvent<[string, PackageLock]>) => {
  switch (e.data[0]) {
    case "generate":
      const lockfile = e.data[1];

      const dependencyCount = Object.keys(lockfile.packages[""].dependencies ?? {}).length;
      const graph = createDependencyGraph(lockfile, (dependencyNumber, dependencyName) => {
        self.postMessage([
          "loadingStatus",
          0,
          (dependencyNumber / dependencyCount) * 100,
          `${dependencyNumber}/${dependencyCount}: ${dependencyName}`,
        ] satisfies LoadingStatusUpdate);
      });

      self.postMessage([
        "complete",
        graph,
        Object.keys(lockfile.packages[""].dependencies ?? {}),
        Object.keys(lockfile.packages[""].devDependencies ?? {}),
      ] satisfies ParseCompleteMessage);
      break;

    default:
      break;
  }
};

export {};
