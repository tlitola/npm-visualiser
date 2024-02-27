"use client";

import { NpmPackage } from "@/utils/PackageLock";
import { readLockFile } from "@/utils/client/parser";
import { useEffect, useState } from "react";
import DragAndDrop from "../DragAndDrop";
import { Card } from "react-bootstrap";
import useSWRMutation from "swr/mutation";
import { useRouter } from "next/navigation";
import { useSWRConfig } from "swr";
import { DepGraph } from "dependency-graph";
import { createDependencyGraph } from "@/utils/client/dependencyTreeParser";
import { getDependencyNamesAndVersions } from "@/utils/client/utils";

const { signal } = new AbortController();

export interface DependencyGraph {
  name: string | undefined;
  version: string | undefined;
  graph: DepGraph<NpmPackage>;
  dependencies?: string[];
  devDependencies?: string[];
  dependencyList: [string, string][];
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
        dependencyList: getDependencyNamesAndVersions(graph),
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
        <DragAndDrop disabled={loadingStatus.isLoading} onFileChange={updateDependencyTree} className="tw-pb-6" />
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
          className="tw-absolute -tw-bottom-2 tw-right-1/2 tw-translate-x-1/2 tw-cursor-pointer tw-font-light tw-italic tw-text-gray-500 tw-underline hover:tw-text-gray-700"
        >
          Use example lockfile
        </p>
      </div>
      {loadingStatus.isLoading && (
        <>
          <div
            className={`tw-fixed tw-left-0 tw-top-0 tw-z-0 tw-h-screen tw-w-screen tw-bg-black tw-opacity-40 tw-transition-all `}
          />
          <Card className="!tw-fixed tw-top-1/2 tw-flex !tw-h-1/2 tw-w-5/6 -tw-translate-y-1/2 tw-flex-col tw-items-center tw-justify-center tw-px-12">
            <h2 className="tw-w-[333px] tw-font-bold tw-text-slate-700 after:tw-inline-block after:tw-w-0 after:tw-animate-dots after:tw-overflow-hidden after:tw-align-bottom after:tw-content-['…']">
              Parsing the lockfile
            </h2>
            <p className="tw-mb-12 tw-text-xl tw-font-medium tw-text-slate-700">This should only take a few seconds</p>
          </Card>
        </>
      )}
    </>
  );
}
