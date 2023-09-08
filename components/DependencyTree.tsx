"use client"

import { NpmPackage, PackageLock, npmPackage } from "@/utils/PackageLock";
import { useState } from "react";
import DragAndDrop from "./DragAndDrop";
import DependencyNode from "./DependencyNode";
import Loading from "./Loading";
import { z } from "zod";

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

  const maybeSetFile = (newFile: File, setError: (error?: string) => void) => {
    if (newFile?.type !== "application/json") return
    setLoading(true)

    const reader = new FileReader()
    reader.readAsText(newFile)
    reader.onerror = () => setError(reader.error?.message)

    reader.onload = () => {
      if (!reader.result) return

      let json

      try {
        json = JSON.parse(reader.result.toString())
      } catch (error) {
        setError("Couldn't parse the file, please make sure it is valid JSON")
        setLoading(false)
      }

      const result = PackageLock.safeParse(json)

      if (!result.success) {
        console.log(result.error.toString())
        setError("Please make sure your package-lock file follows the standard of lockfile version 3")
        setLoading(false)
        return
      }

      const steps = ["Dependencies"]

      result.data.packages[""].devDependencies && steps.push("Dev\nDependencies")
      result.data.packages[""].peerDependencies && steps.push("Peer\nDependencies")


      setLoadingStatus({ step: 0, now: 0, message: "", steps })

      const worker = new Worker(new URL("../utils/dependencyTreeWorker.ts", import.meta.url))

      if (window.Worker) {
        worker.postMessage(["generate", result.data]);
        worker.onerror = (e) => {
          setError(e.message)
          setLoading(false)
        }

        worker.onmessage = (e: MessageEvent<[string, any]>) => {

          switch (e.data[0]) {
            case "complete":
              const messageData = z.tuple([z.array(npmPackage), z.array(npmPackage), z.array(npmPackage)]).safeParse(e.data[1])

              if (!messageData.success) {
                console.log(messageData.error.toString())
                setError("Something went wrong, please try again")
                setLoading(false)
                return
              }

              const [tree, devTree, peerTree] = messageData.data

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
              break;

            case "loadingStatus":
              const loadingData = z.tuple([z.number(), z.number(), z.string()]).safeParse(e.data[1])

              if (!loadingData.success) {
                console.log(loadingData.error.toString())
                setError("Something went wrong, please try again")
                setLoading(false)
                return
              }
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
    }
  }

  return (
    dependencyTree.isLoading
      ? <Loading statusText={loadingStatus.message} step={loadingStatus.step} now={loadingStatus.now} steps={loadingStatus.steps} />
      : dependencyTree.isSet ?
        <section className="flex flex-col items-start min-w-full">
          {dependencyTree.tree.map(el => <DependencyNode dependency={el} depth={1} key={`${el.name}-${el.version}`} />)}
        </section>
        : <DragAndDrop disabled={dependencyTree.isSet || dependencyTree.isLoading} onFileChange={maybeSetFile} />
  )
}