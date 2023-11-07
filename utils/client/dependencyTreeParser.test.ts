import { describe, expect, test } from "vitest";
import { packageLock } from "../PackageLock";
import package_lock_v3 from "../../test/fixtures/package_lock_v3.json";
import { DepGraph } from "dependency-graph";
import { createDependencyGraph } from "./dependencyTreeParser";

describe("createDependencyGraph", () => {
  test("Runs properly", () => {
    const lockFile = packageLock.parse(package_lock_v3);
    const result = createDependencyGraph(lockFile);
    console.log(result);

    expect(result).toBeInstanceOf(DepGraph);
  });
});
