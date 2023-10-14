import { expect, test } from "vitest";
import package_lock_v3 from "../test/fixtures/package_lock_v3.json";
import { packageLock } from "./PackageLock";
import { ZodError } from "zod";

test("Parses v3 schema", async () => {
  expect(packageLock.parse(package_lock_v3)).toHaveProperty("packages");
});

test("Fails on invalid v3 schema", async () => {
  const invalid = { ...package_lock_v3, packages: undefined };
  expect(() => packageLock.parse(invalid)).toThrowError(ZodError);
});
