import { NpmPackage } from "@/utils/PackageLock";
import { faArrowUpRightFromSquare, faCaretDown, faCaretUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useRef, useState } from "react";
import Tag from "../Tag";
import { Stack } from "react-bootstrap";
import { PackageInfo, PackageVulnerability } from "@/utils/Package";
import { findWorstVuln, getChildrenVulnerabilities } from "@/utils/client/utils";
import DependencyModal from "./DependencyModal";
import { DepGraph } from "dependency-graph";

const baseLink = "https://www.npmjs.com/package/";

export default function DependencyNode({
  graph,
  dependencyKey,
  depth,
  parents,
  packageInfo,
  vulns,
}: {
  graph: DepGraph<NpmPackage>;
  dependencyKey: string;
  depth: number;
  parents: Record<string, () => void>;
  packageInfo: Record<string, PackageInfo>;
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

  const dependency = graph.getNodeData(dependencyKey);
  const dependencies = graph.directDependenciesOf(dependencyKey);
  const cyclic = Object.hasOwn(parents, `${dependency.name}-${dependency.version}`);

  return (
    <>
      <span
        className="tw-flex tw-w-full tw-cursor-pointer tw-items-center tw-justify-start tw-rounded tw-p-1 hover:tw-bg-gray-100"
        ref={nodeRef}
        onClick={() => {
          setShowModal(true);
        }}
      >
        <Link
          href={`${baseLink}${dependency.name ?? ""}`}
          target="_blank"
          className="tw-peer tw-my-0 !tw-mr-2 tw-ml-0 tw-text-black tw-no-underline"
          onClick={(e) => e.stopPropagation()}
        >
          {dependency.name}
        </Link>
        <FontAwesomeIcon className="tw-mr-2 tw-hidden tw-h-3 peer-hover:tw-block" icon={faArrowUpRightFromSquare} />

        <Stack direction="horizontal" gap={2}>
          <Tag params={{ type: "version", version: dependency.version ?? "" }} />
          {cyclic && (
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
          {Object.keys(getChildrenVulnerabilities(dependencyKey, graph, vulns)).length !== 0 && (
            <Tag
              params={{
                type: "dangerChildren",
                severity: findWorstVuln(getChildrenVulnerabilities(dependencyKey, graph, vulns)),
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

        {dependencies.length > 0 && !cyclic && (
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
      {open && dependencies.length > 0 && (
        <section
          style={{ marginLeft: 16 * depth, minWidth: `calc(100% - ${16 * depth}px` }}
          className={`tw-flex tw-flex-col tw-items-start`}
        >
          {dependencies.map((el) => {
            const dep = graph.getNodeData(el);
            return (
              <DependencyNode
                vulns={vulns}
                parents={{
                  ...parents,
                  [`${dependency.name}-${dependency.version}`]: hightlightNode,
                }}
                key={`${dep.name}-${dep.version}-${depth}`}
                graph={graph}
                dependencyKey={el}
                depth={depth + 1}
                packageInfo={packageInfo}
              />
            );
          })}
        </section>
      )}
      <DependencyModal
        info={packageInfo[dependency.name + "@" + dependency.version]}
        show={showModal}
        hide={() => setShowModal(false)}
        vulns={vulns[dependency.name + "@" + dependency.version]}
        graph={graph}
        dependencyKey={dependencyKey}
      />
    </>
  );
}
