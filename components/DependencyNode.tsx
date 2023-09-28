"use client"

import { NpmPackage } from "@/utils/PackageLock"
import { faCaretDown, faCaretUp } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import Link from "next/link"
import { useRef, useState } from "react"
import Tag from "./Tag"
import { Stack } from "react-bootstrap"

const baseLink = "https://www.npmjs.com/package/"

export default function DependencyNode({ dependency, depth, parents }: { dependency: NpmPackage; depth: number; parents: { [key: string]: () => void } }) {
  const [show, setShow] = useState(false)

  const nodeRef = useRef<HTMLSpanElement>(null)

  const hightlightNode = async () => {
    if (!nodeRef.current) return

    window.scrollTo({ top: nodeRef.current?.offsetTop - 50 })
    nodeRef.current?.classList.add("animate-highlight")
    await new Promise(resolve => setTimeout(() => { resolve(undefined) }, 1500))
    nodeRef.current?.classList.remove("animate-highlight")

  }

  return (
    <>
      <span className="flex items-center m-1" ref={nodeRef}>
        <Link href={`${baseLink}${dependency.name}`} target="_blank" className="!mr-2 my-0 ml-0 text-black no-underline">{dependency.name}</Link>

        <Stack direction="horizontal" className="m-auto" gap={2}>
          <Tag type="version" version={dependency.version ?? ""} />
          {dependency.cyclic && <Tag type="circular" onClick={() => { parents[`${dependency.name}-${dependency.version}`]() }} />}
        </Stack>

        {((!dependency.dependencies || dependency.dependencies?.length > 0) && !dependency.cyclic) &&
          <FontAwesomeIcon className="ml-3 select-none text-gray-500 hover:text-black" role="button" onClick={() => setShow(prev => !prev)} icon={show ? faCaretUp : faCaretDown} />}

      </span>
      {
        show && dependency.dependencies &&
        <section style={{ marginLeft: 16 * depth }} className="flex flex-col items-start min-w-full">
          {dependency.dependencies.map(el =>
            <DependencyNode
              parents={{ ...parents, [`${dependency.name}-${dependency.version}`]: hightlightNode }}
              key={`${el.name}-${el.version}-${depth}`}
              dependency={el}
              depth={depth + 1} />)}
        </section>
      }
    </>
  )
}