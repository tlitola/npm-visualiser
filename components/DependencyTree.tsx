"use client"

import { NpmPackage, PackageLock } from "@/utils/PackageLock";
import { useEffect, useState } from "react";
import DragAndDrop from "./DragAndDrop";
import { createDependencyTree } from "@/utils/parser";

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

  const setLoading = (loading: boolean) => {
    setDependencyTree(prev => ({ ...prev, isLoading: loading }))
  }

  useEffect(() => {
    console.log(dependencyTree)
  }, [dependencyTree])

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

      const tree = createDependencyTree(result.data, "dependencies")
      const devTree = createDependencyTree(result.data, "devDependencies")
      const peerTree = createDependencyTree(result.data, "peerDependencies")

      setDependencyTree({
        tree,
        devTree,
        peerTree,
        isSet: true,
        isLoading: false
      })
      setError("")

    }
  }

  return (!dependencyTree.isSet ? <DragAndDrop disabled={dependencyTree.isSet || dependencyTree.isLoading} onFileChange={maybeSetFile} /> : <p>Foo</p>)
}