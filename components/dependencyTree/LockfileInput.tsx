"use client";

import { NpmPackage } from "@/utils/PackageLock";
import { readLockFile } from "@/utils/client/parser";
import { LoadingStatusUpdate, ParseCompleteMessage, loadingStatusUpdate } from "@/utils/protocol";
import { useEffect, useState } from "react";
import { z } from "zod";
import DragAndDrop from "../DragAndDrop";
import { Card } from "react-bootstrap";
import Loading from "../Loading";
import useSWRMutation from "swr/mutation";
import { useRouter } from "next/navigation";
import { useSWRConfig } from "swr";
import { getDependencyNamesAndVersions } from "@/utils/client/utils";

const { signal } = new AbortController();
export interface DependencyTreeInterface {
  name: string | undefined;
  version: string | undefined;
  tree: NpmPackage[];
  devTree: NpmPackage[];
  dependencyCount: number;
  dependencies: [string, string][];
}

export default function LockfileInput() {
  const { mutate } = useSWRConfig();

  const { trigger: setDependencyTree } = useSWRMutation(
    "dependencyTree",
    (_key, { arg }: { arg: DependencyTreeInterface }) => arg,
    { populateCache: true },
  );

  useEffect(() => {
    mutate("packageInfo", null);
    mutate("packageVulnerability", null);
  }, [mutate]);

  const [loadingStatus, setLoadingStatus] = useState<{
    isLoading: boolean;
    step: number;
    now: number;
    message: string;
    steps: string[];
  }>({ isLoading: false, step: 0, now: 0, message: "", steps: [] });

  const router = useRouter();

  const setLoading = (loading: boolean) => {
    setLoadingStatus((prev) => ({ ...prev, isLoading: loading }));
  };

  const updateDependencyTree = async (newFile: File, setError: (error?: string) => void) => {
    function handleZodParseError<T>(data: z.SafeParseError<T>) {
      console.log(data.error.toString());
      setError("Something went wrong, please try again");
      setLoading(false);
    }

    try {
      //Parse file
      const lockFile = await readLockFile(newFile, (status) => {
        setLoading(status);
      });

      //Update loading status
      const steps = [];
      lockFile.packages[""].dependencies && steps.push("Dependencies");
      lockFile.packages[""].devDependencies && steps.push("Dev\nDependencies");
      setLoadingStatus({
        isLoading: true,
        step: 0,
        now: 0,
        message: "Current dependency: \n ",
        steps,
      });

      //Create web worker to parse the file
      const worker = new Worker(new URL("../../utils/client/dependencyTreeWorker.ts", import.meta.url));
      if (window.Worker) {
        worker.postMessage(["generate", lockFile]);
        worker.onerror = (e) => {
          setError(e.message);
          setLoading(false);
        };

        worker.onmessage = (
          e: MessageEvent<["complete", ParseCompleteMessage] | ["loadingStatus", LoadingStatusUpdate]>,
        ) => {
          switch (e.data[0]) {
            case "complete":
              const [tree, devTree] = e.data[1];

              setLoadingStatus((prev) => ({
                ...prev,
                step: prev.step + 1,
                now: 0,
                message: "Complete\n ",
              }));

              worker.terminate();

              const deps = getDependencyNamesAndVersions({ tree, devTree });

              setDependencyTree({
                name: lockFile.name,
                version: lockFile.version,
                tree,
                devTree,
                dependencyCount: deps.length,
                dependencies: deps,
              });
              setError("");
              router.push("/report");

              break;

            case "loadingStatus":
              const loadingData = loadingStatusUpdate.safeParse(e.data[1]);
              if (!loadingData.success) {
                handleZodParseError(loadingData);
                return;
              }

              const [step, now, message] = loadingData.data;
              setLoadingStatus((prev) => ({
                ...prev,
                step,
                now,
                message: "Current dependency:\n" + message,
              }));
          }
        };
      }
    } catch (error) {
      setLoading(false);
      if (error instanceof Error) setError(error.message);
    }
  };

  return (
    <>
      <div className="tw-w-screen tw-relative">
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
            updateDependencyTree(file, () => {});
          }}
          className="tw-italic tw-font-light tw-absolute -tw-bottom-2 tw-right-1/2 tw-translate-x-1/2 tw-cursor-pointer tw-text-gray-500 tw-underline hover:tw-text-gray-700"
        >
          Use example lockfile
        </p>
      </div>
      {loadingStatus.isLoading && (
        <>
          <div
            className={`tw-z-0 tw-transition-all tw-bg-black tw-h-screen tw-w-screen tw-fixed tw-top-0 tw-left-0 tw-opacity-40 `}
          />
          <Card className="!tw-h-1/2 tw-flex tw-flex-col tw-items-center tw-justify-center !tw-fixed tw-top-1/2 -tw-translate-y-1/2 tw-px-12 tw-w-5/6">
            <h2 className="tw-w-[333px] tw-font-bold tw-text-slate-700 after:tw-inline-block after:tw-content-['…'] after:tw-align-bottom after:tw-overflow-hidden after:tw-w-0 after:tw-animate-dots">
              Parsing the lockfile
            </h2>
            <p className="tw-text-slate-700 tw-font-medium tw-text-xl tw-mb-12">This should only take a few seconds</p>
            <Loading
              statusText={loadingStatus.message}
              step={loadingStatus.step}
              now={loadingStatus.now}
              steps={loadingStatus.steps}
            />
          </Card>
        </>
      )}
    </>
  );
}
