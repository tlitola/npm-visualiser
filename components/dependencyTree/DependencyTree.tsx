import { NpmPackage } from "@/utils/PackageLock";
import DependencyNode from "./DependencyNode";
import { PackageInfo, PackageVulnerability } from "@/utils/Package";

export default function DependencyTree({
  tree,
  type,
  packageInfo,
  vulns,
}: {
  tree: NpmPackage[];
  type: string;
  eventKey?: string;
  packageInfo: Record<string, PackageInfo>;
  vulns: Record<string, PackageVulnerability[]>;
}) {
  return (
    <>
      {tree.length === 0 && <p className="text-center pt-1">Lockfile provided does not contain any {type}</p>}
      <section id="" className="flex flex-col items-start min-w-full pt-1">
        {tree.map((el) => (
          <DependencyNode
            vulns={vulns}
            packageInfo={packageInfo}
            parents={{}}
            dependency={el}
            depth={1}
            key={`${el.name}-${el.version}`}
          />
        ))}
      </section>
    </>
  );
}
