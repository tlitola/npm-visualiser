import { z } from "zod";

export const loadingStatusUpdate = z.tuple([z.number(), z.number(), z.string()]);
export type LoadingStatusUpdate = z.infer<typeof loadingStatusUpdate>;
