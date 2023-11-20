import { describe, expect, test } from "vitest";
import { packageLock } from "../PackageLock";
import package_lock_v3 from "../../test/fixtures/package_lock_v3.json";
import { createDependencyGraph } from "./dependencyTreeParser";
import { DepGraph } from "dependency-graph";

describe("createDependencyGraph", () => {
  const lockFile = packageLock.parse(package_lock_v3);
  const graph = createDependencyGraph(lockFile);

  test("Runs correctly", () => {
    expect(graph).toBeInstanceOf(DepGraph);
  });

  test("Has correct number of nodes", () => {
    expect(graph.size()).toEqual(893);
  });
});
