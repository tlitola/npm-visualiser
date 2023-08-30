"use client"

import { NpmPackage } from "@/utils/PackageLock"
import { faCaretDown, faCaretUp } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import Link from "next/link"
import { useState } from "react"

const baseLink = "https://www.npmjs.com/package/"

export default function DependencyNode({ dependency, depth }: { dependency: NpmPackage; depth: number }) {
  const [show, setShow] = useState(false)

  return (
    <>
      <span className="flex items-center m-1">
        <Link href={`${baseLink}${dependency.name}`} target="_blank" className="m-0 text-black no-underline">{dependency.name} - {dependency.version}</Link>
        {(!dependency.dependencies || dependency.dependencies?.length > 0) &&
          <FontAwesomeIcon className="ml-3 select-none text-gray-500 hover:text-black" role="button" onClick={() => setShow(prev => !prev)} icon={show ? faCaretUp : faCaretDown} />}
      </span>
      {
        show && dependency.dependencies &&
        <section style={{ marginLeft: 16 * depth }} className="flex flex-col items-start min-w-full">
          {dependency.dependencies.map(el => <DependencyNode key={`${el.name}-${el.version}-${depth}`} dependency={el} depth={depth + 1} />)}
        </section>
      }
    </>
  )
}