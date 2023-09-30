import { z } from "zod";
import { PackageLock } from "../PackageLock";

export const readLockFile = async (
  file: File,
  updateLoadingStatus?: (status: boolean) => void
): Promise<z.infer<typeof PackageLock>> => {
  if (file?.type !== "application/json")
    throw new Error(
      "Couldn't parse the file, please make sure it is valid JSON"
    );
  updateLoadingStatus && updateLoadingStatus(true);

  const text = await file.text();

  let json;
  try {
    json = JSON.parse(text);
  } catch (error) {
    updateLoadingStatus && updateLoadingStatus(false);
    throw new Error(
      "Couldn't parse the file, please make sure it is valid JSON"
    );
  }

  const result = PackageLock.safeParse(json);

  if (!result.success) {
    console.log(result.error.toString());
    updateLoadingStatus && updateLoadingStatus(false);
    throw new Error(
      "Please make sure your package-lock file follows the standard of lockfile version 3"
    );
  }

  return result.data;
};
