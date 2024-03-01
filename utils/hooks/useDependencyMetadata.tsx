import useSWR from "swr";
import { fetchAllDependenciesInfo, fetchVulnerabilities } from "@/utils/client/fetchers";
import { useDependencyGraph } from "@/utils/hooks/useDependencyGraph";

export const useDependencyMetadata = () => {
  const dependencyGraph = useDependencyGraph();

  const { data: dependencyInfo } = useSWR("dependencyInfo", () => fetchAllDependenciesInfo(dependencyGraph.graph), {
    revalidateOnFocus: false,
  });

  const { data: vulnerabilities } = useSWR("packageVulnerability", () => fetchVulnerabilities(dependencyGraph.graph), {
    revalidateOnFocus: false,
  });

  return {
    dependencyInfo: dependencyInfo ?? {},
    dependencyInfoLoading: !dependencyInfo,
    vulnerabilities: vulnerabilities ?? {},
    vulnerabilitiesLoading: !vulnerabilities,
  };
};
