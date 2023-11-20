import { z } from "zod";
import { NpmPackage } from "./PackageLock";
import { DepGraph } from "dependency-graph";

export const loadingStatusUpdate = z.tuple([z.literal("loadingStatus"), z.number(), z.number(), z.string()]);
export type LoadingStatusUpdate = z.infer<typeof loadingStatusUpdate>;

export type ParseCompleteMessage = ["complete", DepGraph<NpmPackage>, string[], string[]];
