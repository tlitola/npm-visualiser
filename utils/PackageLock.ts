import { z } from "zod";

//Zod schemas for handling package tree
const basePackage = z
  .object({
    name: z.string(),
    //There doesn't seem to be a way to merge z.object and z.record without the rules of the latter affecting the first one
    //Version should be optional with key "" but required otherwise, hence offer default if the version is missing
    version: z.string().default("undefined"),
    resolved: z.string(),
    integrity: z.string(),
    cyclic: z.boolean(),
  })
  .partial()
  .passthrough();

export type NpmPackage = z.infer<typeof basePackage> & {
  dependencies?: NpmPackage[];
  devDependencies?: NpmPackage[];
  peerDependencies?: NpmPackage[];
};

export const npmPackage: z.ZodType<NpmPackage> = basePackage.extend({
  dependencies: z.lazy(() => npmPackage.array()).optional(),
  devDependencies: z.lazy(() => npmPackage.array()).optional(),
  peerDependencies: z.lazy(() => npmPackage.array()).optional(),
});

//Zod schema for reading package-lock.json file
export const lockFilePackage = basePackage.extend({
  dependencies: z.record(z.string(), z.string()).optional(),
  peerDependencies: z.record(z.string(), z.string()).optional(),
});

export type LockFilePackage = z.infer<typeof lockFilePackage>;

export const PackageLock = z.object({
  name: z.string(),
  version: z.string().optional(),
  lockfileVersion: z.number(),
  requires: z.boolean().optional(),
  packages: z
    .object({
      "": z.object({
        name: z.string(),
        //There doesn't seem to be a way to merge z.object and z.record without the rules of the latter affecting the first one
        //Version should be optional with key "" but required otherwise, hence offer default if the version is missing
        version: z.string().default("undefined"),
        dependencies: z.record(z.string()).optional(),
        devDependencies: z.record(z.string()).optional(),
        peerDependencies: z.record(z.string()).optional(),
      }),
    })
    .and(z.record(lockFilePackage)),
});

export type PackageLock = z.infer<typeof PackageLock>;
