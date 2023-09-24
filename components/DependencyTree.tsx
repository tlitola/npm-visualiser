"use client"

import { NpmPackage, npmPackage } from "@/utils/PackageLock";
import { useState } from "react";
import DragAndDrop from "./DragAndDrop";
import DependencyNode from "./DependencyNode";
import Loading from "./Loading";
import { z } from "zod";
import { readLockFile } from "@/utils/parser";
import { Tab, Tabs } from "react-bootstrap";

export default function DependencyTree() {
  const [dependencyTree, setDependencyTree] = useState<
    {
      isSet: boolean,
      tree: NpmPackage[],
      devTree: NpmPackage[],
      peerTree: NpmPackage[]
    }
  >({ isSet: false, tree: [], devTree: [], peerTree: [] })

  const [loadingStatus, setLoadingStatus] = useState<{ isLoading: boolean; step: number; now: number; message: string, steps: string[] }>({ isLoading: false, step: 0, now: 0, message: "", steps: [] })

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

      //Update loading status
      const steps = []
      lockFile.packages[""].dependencies && steps.push("Dependencies")
      lockFile.packages[""].devDependencies && steps.push("Dev\nDependencies")
      lockFile.packages[""].peerDependencies && steps.push("Peer\nDependencies")
      setLoadingStatus({ isLoading: true, step: 0, now: 0, message: "", steps })

      //Create web worker to parse the file
      const worker = new Worker(new URL("../utils/dependencyTreeWorker.ts", import.meta.url))
      if (window.Worker) {
        worker.postMessage(["generate", lockFile]);
        worker.onerror = (e) => { setError(e.message); setLoading(false) }

        worker.onmessage = (e: MessageEvent<[string, any]>) => {
          switch (e.data[0]) {
            case "complete":
              const [tree, devTree, peerTree] = e.data[1]

              setLoadingStatus(prev => ({
                ...prev,
                step: prev.step + 1,
                now: 0,
                message: "Complete",
              }))

              setTimeout(() => {
                setLoading(false)
                setDependencyTree({
                  tree,
                  devTree,
                  peerTree,
                  isSet: true,
                })
                setError("")
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

            default:
              break;
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
          <Tabs defaultActiveKey={"dependencies"}>
            <Tab eventKey={"dependencies"}
              title={<p title={dependencyTree.tree.length === 0 ? "Lockfile provided does not contain any dependencies" : ""} className={`m-0 ${dependencyTree.tree.length === 0 && "text-gray-500"}`}>Dependencies</p>}
            >
              {dependencyTree.tree.length === 0 && <p className="text-center pt-1">Lockfile provided does not contain any dependencies</p>}
              <section className="flex flex-col items-start min-w-full px-2 pt-1">
                {dependencyTree.tree.map(el => <DependencyNode parents={{}} dependency={el} depth={1} key={`${el.name}-${el.version}`} />)}
              </section>
            </Tab>
            <Tab eventKey={"devDependencies"}
              title={<p title={dependencyTree.devTree.length === 0 ? "Lockfile provided does not contain any dev dependencies" : ""} className={`m-0 ${dependencyTree.devTree.length === 0 && "text-gray-500"}`}>Dev Dependencies</p>}
            >
              {dependencyTree.devTree.length === 0 && <p className="text-center pt-1">Lockfile provided does not contain any dev dependencies</p>}
              <section className="flex flex-col items-start min-w-full pt-1">
                {dependencyTree.devTree.map(el => <DependencyNode parents={{}} dependency={el} depth={1} key={`${el.name}-${el.version}`} />)}
              </section>
            </Tab>
            <Tab eventKey={"peerDependencies"}
              title={<p title={dependencyTree.peerTree.length === 0 ? "Lockfile provided does not contain any peer dependencies" : ""} className={`m-0 ${dependencyTree.peerTree.length === 0 && "text-gray-500"}`}>Peer Dependencies</p>}
            >
              {dependencyTree.peerTree.length === 0 && <p className="text-center pt-1">Lockfile provided does not contain any peer dependencies</p>}
              <section className="flex flex-col items-start min-w-full pt-1">
                {dependencyTree.peerTree.map(el => <DependencyNode parents={{}} dependency={el} depth={1} key={`${el.name}-${el.version}`} />)}
              </section>

            </Tab>
          </Tabs >
        </>

        : <DragAndDrop disabled={dependencyTree.isSet || loadingStatus.isLoading} onFileChange={updateDependencyTree} />
  )
}