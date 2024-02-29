"use client";

import { NpmPackage } from "@/utils/PackageLock";
import { readLockFile } from "@/utils/client/parser";
import { useEffect, useState } from "react";
import DragAndDrop from "../DragAndDrop";
import useSWRMutation from "swr/mutation";
import { useRouter } from "next/navigation";
import { useSWRConfig } from "swr";
import { DepGraph } from "dependency-graph";
import { createDependencyGraph } from "@/utils/client/dependencyTreeParser";

const { signal } = new AbortController();

export interface DependencyGraph {
  name: string | undefined;
  version: string | undefined;
  graph: DepGraph<NpmPackage>;
  dependencies?: string[];
  devDependencies?: string[];
}

export default function LockfileInput() {
  const { mutate } = useSWRConfig();

  const { trigger: setDependencyTree } = useSWRMutation(
    "dependencyTree",
    (_key, { arg }: { arg: DependencyGraph }) => arg,
    { populateCache: true },
  );

  //reset packageInfo and packageVulnerability, which is important in case of back navigation
  useEffect(() => {
    mutate("packageInfo", null);
    mutate("packageVulnerability", null);
  }, [mutate]);

  const [loadingStatus, setLoadingStatus] = useState<{
    isLoading: boolean;
  }>({ isLoading: false });

  const router = useRouter();

  const updateDependencyTree = async (newFile: File, setError: (error?: string) => void) => {
    try {
      setLoadingStatus({ isLoading: true });
      //Parse file
      const lockFile = await readLockFile(newFile);

      const graph = createDependencyGraph(lockFile);

      await setDependencyTree({
        name: lockFile.name,
        version: lockFile.version,
        graph,
        dependencies: lockFile.packages[""].dependencies ? Object.keys(lockFile.packages[""].dependencies) : undefined,
        devDependencies: lockFile.packages[""].devDependencies
          ? Object.keys(lockFile.packages[""].devDependencies)
          : undefined,
      });

      router.push("/report");
    } catch (error) {
      setLoadingStatus({ isLoading: false });
      if (error instanceof Error) setError(error.message);
    }
  };

  return (
    <>
      <div className="tw-relative tw-w-screen">
        <DragAndDrop loading={loadingStatus.isLoading} onFileInput={updateDependencyTree} className="tw-pb-6" />
        <p
          onClick={async () => {
            const file = new File(
              [await (await fetch("/package_lock_example.json", { signal })).blob()],
              "package_lock_example.json",
              {
                type: "application/json",
              },
            );
            await updateDependencyTree(file, () => {});
          }}
          className={`${
            loadingStatus.isLoading && "tw-hidden"
          } tw-absolute -tw-bottom-2 tw-right-1/2 tw-translate-x-1/2 tw-cursor-pointer tw-font-light tw-italic tw-text-gray-500 tw-underline hover:tw-text-gray-700`}
        >
          Use example lockfile
        </p>
      </div>
    </>
  );
}
