"use client"

import { NpmPackage, ProjectInfo } from "@/utils/PackageLock";
import { useState } from "react";
import DragAndDrop from "./DragAndDrop";
import DependencyNode from "./DependencyNode";
import Loading from "./Loading";
import { z } from "zod";
import { readLockFile } from "@/utils/parser";
import { Card, Col, Row, Stack, Tab, Tabs } from "react-bootstrap";
import Tag from "./Tag";

export default function DependencyTree() {
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
          <Row className="mb-4">
            <Col>
              <Stack direction="horizontal" className="mb-1"><h1 className="my-auto mr-4">{project?.name}</h1>{project?.version && <Tag className="px-2 py-1  !text-base" type="version" version={project?.version} />}</Stack>
              <h4>Something</h4>
            </Col>

            <Col>
              <Stack className="justify-end" direction="horizontal" gap={4}>
                <Card className="!h-32 !w-32 py-2" title="23 dependencies, 10 dev dependencies and 2 peer dependencies">
                  <Card.Title className="!text-base text-center font-normal mb-0">Dependencies</Card.Title>
                  <Card.Body className="text-center font-bold">{dependencyTree.tree.length + dependencyTree.devTree.length + dependencyTree.peerTree.length}</Card.Body>
                  <Card.Footer className="font-light text-sm text-center">{`${dependencyTree.tree.length} / ${dependencyTree.devTree.length} / ${dependencyTree.peerTree.length}`}</Card.Footer>
                </Card>
                <Card className="!h-32 !w-32 py-2" title="There are currently 0 high, 1 medium, and 0 low severity vulnerabilites">
                  <Card.Title className="!text-base text-center font-normal mb-0">Vulnerabilities</Card.Title>
                  <Card.Body className="text-center font-bold">1</Card.Body>
                  <Card.Footer className="font-light text-sm text-center">Medium</Card.Footer>
                </Card>
                <Card className="!h-32 !w-32 py-2" title="Size of all dependencies combined">
                  <Card.Title className="!text-base text-center font-normal mb-0">Total size</Card.Title>
                  <Card.Body className="text-center font-bold">53,78KB</Card.Body>
                  <Card.Footer className="font-light text-sm text-center">Unpacked</Card.Footer>
                </Card>
              </Stack>
            </Col>
          </Row>
          <Row className="h-full overflow-scroll p-2 py-0 rounded-sm shadow content-start">
            <Tabs defaultActiveKey={"dependencies"} className="sticky top-0 bg-white h-fit">
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
          </Row>
        </>

        : <DragAndDrop disabled={dependencyTree.isSet || loadingStatus.isLoading} onFileChange={updateDependencyTree} />
  )
}