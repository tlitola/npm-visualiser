import { z } from "zod";

export const packageInfo = z
  .object({
    name: z.string(),
    version: z.string(),
    description: z.string(),
    license: z.string(),
    unpackedSize: z.number(),
    downloads: z.number(),
    homepage: z.string(),
    repository: z.string(),
  })
  .partial();

export type PackageInfo = z.infer<typeof packageInfo>;

export const downloadHistory = z.object({
  package: z.string(),
  downloads: z.array(
    z.object({
      downloads: z.number(),
      week: z.string(),
    }),
  ),
});

export type DownloadHistory = z.infer<typeof downloadHistory>;

export const packageVulnerability = z.object({
  id: z.string(),
  name: z.string(),
  version: z.string(),
  summary: z.string().optional(),
  details: z.string(),
  published: z.string(),
  modified: z.string(),
  severity: z
    .object({
      score: z.number(),
      text: z.string(),
      vector: z.string().optional(),
    })
    .optional(),
  from: z.string().optional(),
  to: z.string().optional(),
});

export type PackageVulnerability = z.infer<typeof packageVulnerability>;
