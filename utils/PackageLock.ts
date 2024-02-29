import { z } from "zod";

//Zod schemas for handling package tree
export const npmPackage = z
  .object({
    name: z.string(),
    //There doesn't seem to be a way to merge z.object and z.record without the rules of the latter affecting the first one
    //Version should be optional with key "" but required otherwise, hence offer default if the version is missing
    version: z.string().default("undefined"),
    resolved: z.string().default("undefined"),
    integrity: z.string().default("undefined"),
    optional: z.boolean(),
    peer: z.boolean(),
  })
  .partial({ peer: true, optional: true, name: true })
  .passthrough();

export type NpmPackage = z.infer<typeof npmPackage>;

//Zod schema for reading package-lock.json file
export const lockFilePackage = npmPackage.extend({
  dependencies: z.record(z.string(), z.string()).optional(),
});

export type LockFilePackage = z.infer<typeof lockFilePackage>;

export const packageLock = z.object({
  name: z.string(),
  author: z.string().optional(),
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
        resolved: z.string().default("undefined"),
        integrity: z.string().default("undefined"),
        dependencies: z.record(z.string()).optional(),
        devDependencies: z.record(z.string()).optional(),
      }),
    })
    .and(z.record(lockFilePackage)),
});

export type PackageLock = z.infer<typeof packageLock>;
