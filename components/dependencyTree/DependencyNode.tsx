"use client";

import { NpmPackage } from "@/utils/PackageLock";
import { faArrowUpRightFromSquare, faCaretDown, faCaretUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useRef, useState } from "react";
import Tag from "../Tag";
import { Stack } from "react-bootstrap";
import { PackageInfo, PackageVulnerability } from "@/utils/Package";
import { findWorstVuln, getChildrenVulnerabilities } from "@/utils/client/utils";
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

    nodeRef.current?.classList.add("tw-animate-highlight");
    await new Promise((resolve) =>
      setTimeout(() => {
        resolve(undefined);
      }, 1500),
    );
    nodeRef.current?.classList.remove("tw-animate-highlight");
  };

  return (
    <>
      <span
        className="tw-flex tw-items-center tw-justify-start tw-p-1 tw-w-full tw-cursor-pointer hover:tw-bg-gray-100 tw-rounded"
        ref={nodeRef}
        onClick={() => {
          setShowModal(true);
        }}
      >
        <Link
          href={`${baseLink}${dependency.name ?? ""}`}
          target="_blank"
          className="!tw-mr-2 tw-my-0 tw-ml-0 tw-text-black tw-no-underline tw-peer"
          onClick={(e) => e.stopPropagation()}
        >
          {dependency.name}
        </Link>
        <FontAwesomeIcon className="tw-mr-2 tw-h-3 tw-hidden peer-hover:tw-block" icon={faArrowUpRightFromSquare} />

        <Stack direction="horizontal" gap={2}>
          <Tag params={{ type: "version", version: dependency.version ?? "" }} />
          {dependency.cyclic && (
            <Tag
              params={{ type: "circular" }}
              onClick={(e) => {
                e.stopPropagation();
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
          {Object.keys(getChildrenVulnerabilities(dependency, vulns)).length !== 0 && (
            <Tag
              params={{
                type: "dangerChildren",
                severity: findWorstVuln(getChildrenVulnerabilities(dependency, vulns)),
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
            className="tw-ml-3 tw-select-none tw-text-gray-500 hover:tw-text-black"
            role="button"
            onClick={(e) => {
              e.stopPropagation();
              setOpen((prev) => !prev);
            }}
            icon={open ? faCaretUp : faCaretDown}
          />
        )}
      </span>
      {open && dependency.dependencies && (
        <section
          style={{ marginLeft: 16 * depth, minWidth: `calc(100% - ${16 * depth}px` }}
          className={`tw-flex tw-flex-col tw-items-start`}
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
