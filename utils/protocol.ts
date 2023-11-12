import { z } from "zod";
import { NpmPackage } from "./PackageLock";

export const loadingStatusUpdate = z.tuple([z.number(), z.number(), z.string()]);
export type LoadingStatusUpdate = z.infer<typeof loadingStatusUpdate>;

export type ParseCompleteMessage = [NpmPackage[], NpmPackage[]];
