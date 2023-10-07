"use client";

import { NpmPackage } from "@/utils/PackageLock";
import { faArrowUpRightFromSquare, faCaretDown, faCaretUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useRef, useState } from "react";
import Tag from "../Tag";
import { Stack } from "react-bootstrap";
import { PackageInfo, PackageVulnerability } from "@/utils/Package";
import { findWorstVuln } from "@/utils/client/utlis";
import DepepndencyModal from "./DependencyModal";

const baseLink = "https://www.npmjs.com/package/";

export default function DependencyNode({
  dependency,
  depth,
  parents,
  packageInfo,
  vulns,
}: {
  packageInfo: Record<string, PackageInfo>;
  dependency: NpmPackage;
  depth: number;
  parents: { [key: string]: () => void };
  vulns: Record<string, PackageVulnerability[]>;
}) {
  const [open, setOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const nodeRef = useRef<HTMLSpanElement>(null);

  const hightlightNode = async () => {
    if (!nodeRef.current) return;

    nodeRef.current.scrollIntoView();

    nodeRef.current?.classList.add("animate-highlight");
    await new Promise((resolve) =>
      setTimeout(() => {
        resolve(undefined);
      }, 1500),
    );
    nodeRef.current?.classList.remove("animate-highlight");
  };

  return (
    <>
      <span
        className="flex items-center justify-start p-1 w-full cursor-pointer hover:bg-gray-100 rounded"
        ref={nodeRef}
        onClick={() => setShowModal(true)}
      >
        <Link
          href={`${baseLink}${dependency.name}`}
          target="_blank"
          className="!mr-2 my-0 ml-0 text-black no-underline peer"
          onClick={(e) => e.stopPropagation()}
        >
          {dependency.name}
        </Link>
        <FontAwesomeIcon className="mr-2 h-3 hidden peer-hover:block" icon={faArrowUpRightFromSquare} />

        <Stack direction="horizontal" gap={2}>
          <Tag params={{ type: "version", version: dependency.version ?? "" }} />
          {dependency.cyclic && (
            <Tag
              params={{ type: "circular" }}
              onClick={() => {
                parents[`${dependency.name}-${dependency.version}`]();
              }}
            />
          )}
          {Object.hasOwn(vulns, dependency.name + "@" + dependency.version) && (
            <Tag
              params={{
                type: "danger",
                severity: findWorstVuln({
                  "": vulns[dependency.name + "@" + dependency.version],
                }),
              }}
            />
          )}
          {packageInfo[dependency.name + "@" + dependency.version]?.unpackedSize === 0 && (
            <Tag
              params={{
                type: "warning",
                message: "Couldn't fetch the size of this package",
              }}
            />
          )}
        </Stack>

        {(!dependency.dependencies || dependency.dependencies?.length > 0) && !dependency.cyclic && (
          <FontAwesomeIcon
            className="ml-3 select-none text-gray-500 hover:text-black"
            role="button"
            onClick={() => setOpen((prev) => !prev)}
            icon={open ? faCaretUp : faCaretDown}
          />
        )}
      </span>
      {open && dependency.dependencies && (
        <section
          style={{ marginLeft: 16 * depth }}
          className={`flex flex-col items-start min-w-[calc(100% - ${16 * depth}px)]`}
        >
          {dependency.dependencies.map((el) => (
            <DependencyNode
              vulns={vulns}
              parents={{
                ...parents,
                [`${dependency.name}-${dependency.version}`]: hightlightNode,
              }}
              key={`${el.name}-${el.version}-${depth}`}
              dependency={el}
              depth={depth + 1}
              packageInfo={packageInfo}
            />
          ))}
        </section>
      )}
      <DepepndencyModal
        info={packageInfo[dependency.name + "@" + dependency.version]}
        show={showModal}
        hide={() => setShowModal(false)}
        vulns={vulns[dependency.name + "@" + dependency.version]}
        dependency={dependency}
      />
    </>
  );
}
