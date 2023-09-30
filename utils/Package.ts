import { z } from "zod";

export const packageInfo = z
  .object({
    name: z.string(),
    version: z.string(),
    description: z.string(),
    license: z.string(),
    unpackedSize: z.number(),
    downloads: z.number(),
  })
  .partial();

export type PackageInfo = z.infer<typeof packageInfo>;
