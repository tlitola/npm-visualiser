import { z } from "zod";

export const PackageLock = z.object({
  name: z.string(),
  version: z.string(),
  lockfileVersion: z.number(),
  requires: z.boolean(),
  packages: z.intersection(
    z.object({
      "": z.object({
        name: z.string(),
        version: z.string(),
        dependencies: z.record(z.string()),
      }),
    }),
    z.record(
      z
        .object({
          version: z.string(),
          resolved: z.string(),
          integrity: z.string(),
          dependencies: z.optional(z.record(z.string())),
        })
        .partial()
        .required({ version: true })
        .passthrough()
    )
  ),
});
