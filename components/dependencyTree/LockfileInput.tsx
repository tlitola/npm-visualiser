"use client";

import { NpmPackage } from "@/utils/PackageLock";
import { readLockFile } from "@/utils/client/parser";
import { LoadingStatusUpdate, ParseCompleteMessage, loadingStatusUpdate } from "@/utils/protocol";
import { useState } from "react";
import { z } from "zod";
import DragAndDrop from "../DragAndDrop";
import { Card } from "react-bootstrap";
import Loading from "../Loading";
import useSWRMutation from "swr/mutation";
import { useRouter } from "next/navigation";

export interface DependencyTreeInterface {
  name: string | undefined;
  version: string | undefined;
  tree: NpmPackage[];
  devTree: NpmPackage[];
  dependencyCount: number;
}

export default function LockfileInput() {
  const { trigger: setDependencyTree } = useSWRMutation(
    "dependencyTree",
    (_key, { arg }: { arg: DependencyTreeInterface }) => arg,
    { populateCache: true },
  );

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
        message: "Current: \n s",
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
              const [tree, devTree, count] = e.data[1];

              setLoadingStatus((prev) => ({
                ...prev,
                step: prev.step + 1,
                now: 0,
                message: "Complete\n ",
              }));

              setTimeout(async () => {
                await setDependencyTree({
                  name: lockFile.name,
                  version: lockFile.version,
                  tree,
                  devTree,
                  dependencyCount: count,
                });
                setError("");
                router.push("/report");
              }, 1000);

              worker.terminate();

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
      <DragAndDrop disabled={loadingStatus.isLoading} onFileChange={updateDependencyTree} />;
      {loadingStatus.isLoading && (
        <>
          <div className={` z-0 transition-all  bg-black h-screen w-screen fixed top-0 left-0 opacity-40 `} />
          <Card className="!h-1/2 flex flex-col items-center justify-center !fixed top-1/2 -translate-y-1/2 px-12 w-5/6">
            <h2 className="w-[333px] font-bold text-slate-700 after:inline-block after:content-['…'] after:align-bottom after:overflow-hidden after:w-0 after:animate-dots">
              Parsing the lockfile
            </h2>
            <p className="text-slate-700 font-medium text-xl mb-12">This should only take a few seconds</p>
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
