import DependencyNode from "./DependencyNode";
import { useDependencyGraph } from "@/utils/hooks/useDependencyGraph";

export default function DependencyTree({ dependencies, type }: { dependencies: string[]; type: string }) {
  const graph = useDependencyGraph().graph;
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
              dependencyKey={el}
              parents={{}}
              depth={1}
              key={`0-${dependency.name}@${dependency.version}`}
            />
          );
        })}
      </section>
    </>
  );
}
