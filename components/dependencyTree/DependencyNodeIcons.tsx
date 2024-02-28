import Tag from "@/components/Tag";
import { findWorstVulnerability, getChildrenVulnerabilities } from "@/utils/client/utils";
import { Stack } from "react-bootstrap";
import { useDependencyGraph } from "@/utils/hooks/useDependencyGraph";
import { useDependencyMetadata } from "@/utils/hooks/useDependencyMetadata";
import { MouseEventHandler } from "react";

export function DependencyNodeIcons({
  dependencyKey,
  cyclic,
  onCyclicClick,
}: {
  dependencyKey: string;
  cyclic: boolean;
  onCyclicClick: MouseEventHandler<HTMLDivElement>;
}) {
  const graph = useDependencyGraph().graph;
  const { vulnerabilities, dependencyInfo } = useDependencyMetadata();

  const dependency = graph.getNodeData(dependencyKey);
  const childVulnerabilities = getChildrenVulnerabilities(dependencyKey, graph, vulnerabilities);
  return (
    <Stack direction="horizontal" gap={2}>
      <Tag params={{ type: "version", version: dependency.version ?? "" }} />
      {cyclic && <Tag params={{ type: "circular" }} onClick={onCyclicClick} />}
      {Object.hasOwn(vulnerabilities, dependency.integrity) && (
        <Tag
          params={{
            type: "danger",
            severity: findWorstVulnerability({
              [dependencyKey]: vulnerabilities[dependency.integrity],
            }),
          }}
        />
      )}
      {Object.keys(childVulnerabilities).length !== 0 && (
        <Tag
          params={{
            type: "dangerChildren",
            severity: findWorstVulnerability(childVulnerabilities),
          }}
        />
      )}
      {dependencyInfo[dependency.integrity]?.unpackedSize === 0 && (
        <Tag
          params={{
            type: "warning",
            message: "Couldn't fetch the size of this package",
          }}
        />
      )}
    </Stack>
  );
}
