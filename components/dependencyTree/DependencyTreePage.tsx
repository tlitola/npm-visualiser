"use client"

import { NpmPackage, ProjectInfo } from "@/utils/PackageLock";
import useSWR, { useSWRConfig } from "swr";
import { useState } from "react";
import DragAndDrop from "../DragAndDrop";
import Loading from "../Loading";
import { z } from "zod";
import { readLockFile } from "@/utils/client/parser";
import { Card, Row, Tab, Tabs } from "react-bootstrap";
import { fetchAllPackagesInfo } from "@/utils/client/fetchers";
import { getPackageNameAndVersion } from "@/utils/client/utlis";
import DependencyTree from "./DependencyTree";
import DTPageHeader from "./DTPageHeader";


export default function DependencyTreePage() {
  const { mutate } = useSWRConfig()

  const [dependencyTree, setDependencyTree] = useState<
    {
      isSet: boolean,
      tree: NpmPackage[],
      devTree: NpmPackage[],
      peerTree: NpmPackage[]
    }
  >({ isSet: false, tree: [], devTree: [], peerTree: [] })

  const [project, setProject] = useState<ProjectInfo>()

  const [loadingStatus, setLoadingStatus] = useState<{ isLoading: boolean; step: number; now: number; message: string, steps: string[] }>({ isLoading: false, step: 0, now: 0, message: "", steps: [] })

  const { data: packageInfo, error: packageInfoError } = useSWR("packageInfo", () => fetchAllPackagesInfo(getPackageNameAndVersion(dependencyTree)), { revalidateOnFocus: false })

  const setLoading = (loading: boolean) => {
    setLoadingStatus(prev => ({ ...prev, isLoading: loading }))
  }

  const updateDependencyTree = async (newFile: File, setError: (error?: string) => void) => {

    const handleZodParseError = (data: z.SafeParseError<any>) => {
      console.log(data.error.toString())
      setError("Something went wrong, please try again")
      setLoading(false)
    }

    try {
      //Parse file
      const lockFile = await readLockFile(newFile, (status) => { setLoading(status) })

      setProject({ name: lockFile.name, version: lockFile.version })

      //Update loading status
      const steps = []
      lockFile.packages[""].dependencies && steps.push("Dependencies")
      lockFile.packages[""].devDependencies && steps.push("Dev\nDependencies")
      lockFile.packages[""].peerDependencies && steps.push("Peer\nDependencies")
      setLoadingStatus({ isLoading: true, step: 0, now: 0, message: "", steps })

      //Create web worker to parse the file
      const worker = new Worker(new URL("../../utils/client/dependencyTreeWorker.ts", import.meta.url))
      if (window.Worker) {
        worker.postMessage(["generate", lockFile]);
        worker.onerror = (e) => { setError(e.message); setLoading(false) }

        worker.onmessage = (e: MessageEvent<[string, any]>) => {
          switch (e.data[0]) {
            case "complete":
              const [tree, devTree, peerTree] = e.data[1] as NpmPackage[][]

              setLoadingStatus(prev => ({
                ...prev,
                step: prev.step + 1,
                now: 0,
                message: "Complete",
              }))

              setTimeout(async () => {
                setLoading(false)
                setDependencyTree({
                  tree,
                  devTree,
                  peerTree,
                  isSet: true,
                })
                setError("")
                mutate("packageInfo", async () => await fetchAllPackagesInfo(getPackageNameAndVersion({ tree, devTree, peerTree })))

              }, 1000);

              worker.terminate()

              break;

            case "loadingStatus":
              const loadingData = z.tuple([z.number(), z.number(), z.string()]).safeParse(e.data[1])
              if (!loadingData.success) { handleZodParseError(loadingData); return }

              const [step, now, message] = loadingData.data
              setLoadingStatus(prev => ({
                ...prev,
                step,
                now,
                message,
              }))
          }
        }
      }
    } catch (error) {
      setLoading(false)
      if (error instanceof Error) setError(error.message)
    }
  }


  return (
    loadingStatus.isLoading
      ? <Loading statusText={loadingStatus.message} step={loadingStatus.step} now={loadingStatus.now} steps={loadingStatus.steps} />
      : dependencyTree.isSet ?
        <>
          <DTPageHeader packageInfo={packageInfo ?? {}} dependencyTree={dependencyTree} project={project} />
          <Row className="h-full overflow-y-scroll p-2 py-0 rounded-sm shadow content-start scroll-pt-24 scroll-smooth">
            <Tabs defaultActiveKey={"dependencies"} className="sticky top-0 bg-white h-fit">
              <Tab eventKey={"dependencies"} title={<p title={dependencyTree.tree.length === 0 ? "Lockfile provided does not contain any peer dependencies" : ""} className={`m-0 ${dependencyTree.tree.length === 0 && "text-gray-500"}`}>Dependencies</p>}>
                <DependencyTree packageInfo={packageInfo ?? {}} tree={dependencyTree.tree} type="dependencies" />
              </Tab>
              <Tab eventKey={"devDependencies"} title={<p title={dependencyTree.devTree.length === 0 ? "Lockfile provided does not contain any peer dependencies" : ""} className={`m-0 ${dependencyTree.devTree.length === 0 && "text-gray-500"}`}>Dev Dependencies</p>}>
                <DependencyTree packageInfo={packageInfo ?? {}} tree={dependencyTree.devTree} type="dev dependencies" />
              </Tab>
              <Tab eventKey={"peerDependencies"} title={<p title={dependencyTree.peerTree.length === 0 ? "Lockfile provided does not contain any peer dependencies" : ""} className={`m-0 ${dependencyTree.peerTree.length === 0 && "text-gray-500"}`}>Peer Dependencies</p>}>
                <DependencyTree packageInfo={packageInfo ?? {}} tree={dependencyTree.peerTree} type="peer dependencies" />
              </Tab>
            </Tabs >
          </Row>
        </>

        : <>
          <DragAndDrop disabled={dependencyTree.isSet || loadingStatus.isLoading} onFileChange={updateDependencyTree} />
        </>
  )
}