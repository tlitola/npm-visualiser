"use client"

import { NpmPackage, npmPackage } from "@/utils/PackageLock";
import { useState } from "react";
import DragAndDrop from "./DragAndDrop";
import DependencyNode from "./DependencyNode";
import Loading from "./Loading";
import { z } from "zod";
import { readLockFile } from "@/utils/parser";

export default function DependencyTree() {
  const [dependencyTree, setDependencyTree] = useState<
    {
      isSet: boolean,
      isLoading: boolean,
      tree: NpmPackage[],
      devTree: NpmPackage[],
      peerTree: NpmPackage[]
    }
  >({ isSet: false, isLoading: false, tree: [], devTree: [], peerTree: [] })

  const [loadingStatus, setLoadingStatus] = useState<{ step: number; now: number; message: string, steps: string[] }>({ step: 0, now: 0, message: "", steps: [] })

  const setLoading = (loading: boolean) => {
    setDependencyTree(prev => ({ ...prev, isLoading: loading }))
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
      setLoadingStatus({ step: 0, now: 0, message: "", steps })

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
                step: prev.step + 1,
                now: 0,
                message: "Complete",
                steps: prev.steps
              }))

              setTimeout(() => {
                setDependencyTree({
                  tree,
                  devTree,
                  peerTree,
                  isSet: true,
                  isLoading: false
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
                step,
                now,
                message,
                steps: prev.steps
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
    dependencyTree.isLoading
      ? <Loading statusText={loadingStatus.message} step={loadingStatus.step} now={loadingStatus.now} steps={loadingStatus.steps} />
      : dependencyTree.isSet ?
        <div>
          <section className="flex flex-col items-start min-w-full">
            {dependencyTree.tree.map(el => <DependencyNode dependency={el} depth={1} key={`${el.name}-${el.version}`} />)}
          </section>
          <section className="flex flex-col items-start min-w-full bg-emerald-100">
            {dependencyTree.devTree.map(el => <DependencyNode dependency={el} depth={1} key={`${el.name}-${el.version}`} />)}
          </section>
          <section className="flex flex-col items-start min-w-full bg-cyan-100">
            {dependencyTree.peerTree.map(el => <DependencyNode dependency={el} depth={1} key={`${el.name}-${el.version}`} />)}
          </section>
        </div>
        : <DragAndDrop disabled={dependencyTree.isSet || dependencyTree.isLoading} onFileChange={updateDependencyTree} />
  )
}