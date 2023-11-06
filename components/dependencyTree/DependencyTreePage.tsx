"use client";

import { NpmPackage, ProjectInfo } from "@/utils/PackageLock";
import { fetchAllPackagesInfo, fetchAllPackagesVulnerabilites } from "@/utils/client/fetchers";
import { readLockFile } from "@/utils/client/parser";
import { getPackageNameAndVersion } from "@/utils/client/utils";
import { useState } from "react";
import { Card, Row, Tab, Tabs } from "react-bootstrap";
import useSWR, { useSWRConfig } from "swr";
import { z } from "zod";
import Loading from "../Loading";
import DTPageHeader from "./DTPageHeader";
import DependencyTree from "./DependencyTree";
import { LoadingStatusUpdate, ParseCompleteMessage, loadingStatusUpdate } from "@/utils/protocol";
import DragAndDropPage from "./DragAndDropPage";

export default function DependencyTreePage() {
  const { mutate } = useSWRConfig();

  const [dependencyTree, setDependencyTree] = useState<{
    isSet: boolean;
    tree: NpmPackage[];
    devTree: NpmPackage[];
    dependencyCount: number;
  }>({ isSet: false, tree: [], devTree: [], dependencyCount: 0 });

  const [project, setProject] = useState<ProjectInfo>();

  const [loadingStatus, setLoadingStatus] = useState<{
    isLoading: boolean;
    step: number;
    now: number;
    message: string;
    steps: string[];
  }>({ isLoading: false, step: 0, now: 0, message: "", steps: [] });

  const { data: packageInfo } = useSWR(
    "packageInfo",
    () => fetchAllPackagesInfo(getPackageNameAndVersion(dependencyTree)),
    { revalidateOnFocus: false },
  );
  const { data: vulns } = useSWR(
    "packageVulnerability",
    () => fetchAllPackagesVulnerabilites(getPackageNameAndVersion(dependencyTree)),
    { revalidateOnFocus: false },
  );

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

      setProject({ name: lockFile.name, version: lockFile.version });

      //Update loading status
      const steps = [];
      lockFile.packages[""].dependencies && steps.push("Dependencies");
      lockFile.packages[""].devDependencies && steps.push("Dev\nDependencies");
      setLoadingStatus({
        isLoading: true,
        step: 0,
        now: 0,
        message: "",
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
                setLoading(false);
                setDependencyTree({
                  tree,
                  devTree,
                  isSet: true,
                  dependencyCount: count,
                });
                setError("");
                mutate(
                  "packageInfo",
                  async () => await fetchAllPackagesInfo(getPackageNameAndVersion({ tree, devTree })),
                );
                mutate(
                  "packageVulnerability",
                  async () => await fetchAllPackagesVulnerabilites(getPackageNameAndVersion({ tree, devTree })),
                );
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

  return dependencyTree.isSet ? (
    <>
      <DTPageHeader vulns={vulns} packageInfo={packageInfo} dependencyTree={dependencyTree} project={project} />
      <Row className="w-full h-full overflow-y-scroll p-2 py-0 rounded-sm shadow content-start scroll-pt-24 scroll-smooth">
        <Tabs defaultActiveKey={"dependencies"} className="sticky top-0 bg-white h-fit">
          <Tab
            eventKey={"dependencies"}
            title={
              <p
                title={dependencyTree.tree.length === 0 ? "Lockfile provided does not contain any dependencies" : ""}
                className={`m-0 ${dependencyTree.tree.length === 0 && "text-gray-500"}`}
              >
                Dependencies
              </p>
            }
          >
            <DependencyTree
              vulns={vulns ?? {}}
              packageInfo={packageInfo ?? {}}
              tree={dependencyTree.tree}
              type="dependencies"
            />
          </Tab>
          <Tab
            eventKey={"devDependencies"}
            title={
              <p
                title={dependencyTree.devTree.length === 0 ? "Lockfile provided does not contain any dependencies" : ""}
                className={`m-0 ${dependencyTree.devTree.length === 0 && "text-gray-500"}`}
              >
                Dev Dependencies
              </p>
            }
          >
            <DependencyTree
              vulns={vulns ?? {}}
              packageInfo={packageInfo ?? {}}
              tree={dependencyTree.devTree}
              type="dev dependencies"
            />
          </Tab>
        </Tabs>
      </Row>
    </>
  ) : (
    <>
      <DragAndDropPage disabled={dependencyTree.isSet || loadingStatus.isLoading} onFileChange={updateDependencyTree} />
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
          </Card>{" "}
        </>
      )}
    </>
  );
}
