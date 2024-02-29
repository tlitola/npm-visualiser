import useSWR from "swr";
import { DependencyGraph } from "@/components/dependencyTree/LockfileInput";
import { redirect } from "next/navigation";

export const useDependencyGraph = () => {
  const { data: dependencyGraph } = useSWR<DependencyGraph>("dependencyTree", { revalidateOnFocus: false });

  return dependencyGraph ? dependencyGraph : redirect("/");
};
