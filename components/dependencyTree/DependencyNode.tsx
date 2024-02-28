import { faArrowUpRightFromSquare, faCaretDown, faCaretUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useRef, useState } from "react";
import DependencyModal from "./DependencyModal";
import { useDependencyGraph } from "@/utils/hooks/useDependencyGraph";
import { DependencyNodeIcons } from "@/components/dependencyTree/DependencyNodeIcons";
import { NPM_API_BASE_URL } from "@/utils/constants/constants";

export default function DependencyNode({
  dependencyKey,
  depth,
  parents,
}: {
  dependencyKey: string;
  depth: number;
  parents: Record<string, () => void>;
}) {
  const graph = useDependencyGraph().graph;

  const [expanded, setExpanded] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const nodeRef = useRef<HTMLSpanElement>(null);

  const highlightNode = async () => {
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
  const cyclic = Object.hasOwn(parents, dependency.integrity);

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
          href={`${NPM_API_BASE_URL}${dependency.name ?? ""}`}
          target="_blank"
          className="tw-peer tw-my-0 !tw-mr-2 tw-ml-0 tw-text-black tw-no-underline"
          onClick={(e) => e.stopPropagation()}
        >
          {dependency.name}
        </Link>
        <FontAwesomeIcon className="tw-mr-2 tw-hidden tw-h-3 peer-hover:tw-block" icon={faArrowUpRightFromSquare} />

        <DependencyNodeIcons
          dependencyKey={dependencyKey}
          cyclic={cyclic}
          onCyclicClick={(e) => {
            e.stopPropagation();
            parents[dependency.integrity]();
          }}
        />
        {/*Expand dependency tree*/}
        {dependencies.length > 0 && !cyclic && (
          <FontAwesomeIcon
            className="tw-ml-3 tw-select-none tw-text-gray-500 hover:tw-text-black"
            role="button"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded((prev) => !prev);
            }}
            icon={expanded ? faCaretUp : faCaretDown}
          />
        )}
      </span>
      {expanded && dependencies.length > 0 && (
        <section
          style={{ marginLeft: 16 * depth, minWidth: `calc(100% - ${16 * depth}px` }}
          className={`tw-flex tw-flex-col tw-items-start`}
        >
          {dependencies.map((key) => {
            const dep = graph.getNodeData(key);
            return (
              <DependencyNode
                parents={{
                  ...parents,
                  [dependency.integrity]: highlightNode,
                }}
                key={`${depth}-${dep.name}@${dep.version}`}
                dependencyKey={key}
                depth={depth + 1}
              />
            );
          })}
        </section>
      )}
      <DependencyModal show={showModal} hide={() => setShowModal(false)} dependencyKey={dependencyKey} />
    </>
  );
}
