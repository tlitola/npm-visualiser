import { NpmPackage } from "@/utils/PackageLock";
import DependencyNode from "./DependencyNode";
import { PackageInfo, PackageVulnerability } from "@/utils/Package";
import { DepGraph } from "dependency-graph";

export default function DependencyTree({
  dependencies,
  graph,
  type,
  packageInfo,
  vulns,
}: {
  dependencies: string[];
  graph: DepGraph<NpmPackage>;
  type: string;
  packageInfo: Record<string, PackageInfo>;
  vulns: Record<string, PackageVulnerability[]>;
}) {
  return (
    <>
      {dependencies.length === 0 && (
        <p className="tw-pt-1 tw-text-center">Lockfile provided does not contain any {type}</p>
      )}
      <section id="" className="tw-flex tw-min-w-full tw-flex-col tw-items-start tw-pt-1">
        {dependencies.map((el) => {
          const dependency = graph.getNodeData(el);
          return (
            <DependencyNode
              graph={graph}
              dependencyKey={el}
              vulns={vulns}
              packageInfo={packageInfo}
              parents={{}}
              depth={1}
              key={`${dependency.name}-${dependency.version}`}
            />
          );
        })}
      </section>
    </>
  );
}
