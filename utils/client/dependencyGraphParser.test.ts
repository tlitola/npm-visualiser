import { describe, expect, it } from "vitest";
import { packageLock } from "../PackageLock";
import package_lock_v3 from "../../test/fixtures/package_lock_v3.json";
import { createDependencyGraph } from "./dependencyGraphParser";
import { DepGraph } from "dependency-graph";

describe("createDependencyGraph", () => {
  const lockFile = packageLock.parse(package_lock_v3);
  const graph = createDependencyGraph(lockFile);
  it("Runs correctly", () => {
    expect(graph).toBeInstanceOf(DepGraph);
  });

  it("Has correct number of entries", () => {
    expect(graph.size()).toEqual(568);
  });
});
