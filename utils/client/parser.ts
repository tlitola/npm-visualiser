import { PackageLock, packageLock } from "../PackageLock";

export const readLockFile = async (file: File): Promise<PackageLock> => {
  if (file?.type !== "application/json") throw new Error("Couldn't parse the file, please make sure it is valid JSON");
  const text = await file.text();

  let json;
  try {
    json = JSON.parse(text);
  } catch (error) {
    throw new Error("Couldn't parse the file, please make sure it is valid JSON");
  }

  const result = packageLock.safeParse(json);

  if (!result.success) {
    console.log(result.error.toString());
    throw new Error("Please make sure your package-lock file follows the standard of lockfile version 3");
  }

  return result.data;
};
