"use client";

import { Row, Tab, Tabs } from "react-bootstrap";
import useSWR from "swr";
import DTPageHeader from "./DTPageHeader";
import DependencyTree from "./DependencyTree";
import { redirect } from "next/navigation";
import { fetchAllPackagesInfo, fetchAllPackagesVulnerabilites } from "@/utils/client/fetchers";
import { DependencyGraph } from "./LockfileInput";

export default function DependencyTreePage() {
  const { data: dependencyGraph } = useSWR<DependencyGraph>("dependencyTree", { revalidateOnFocus: false });

  const { data: packageInfo } = useSWR(
    "packageInfo",
    () => fetchAllPackagesInfo(dependencyGraph?.dependencyList ?? []),
    {
      revalidateOnFocus: false,
    },
  );

  const { data: vulns } = useSWR(
    "packageVulnerability",
    () => fetchAllPackagesVulnerabilites(dependencyGraph?.dependencyList ?? []),
    { revalidateOnFocus: false },
  );

  return dependencyGraph ? (
    <>
      <DTPageHeader vulns={vulns} packageInfo={packageInfo} dependencyGraph={dependencyGraph} />
      <Row className="tw-w-full tw-h-full tw-overflow-y-scroll tw-p-2 tw-py-0 tw-rounded-sm tw-shadow tw-content-start tw-scroll-pt-24 tw-scroll-smooth">
        <Tabs defaultActiveKey={"dependencies"} className="tw-sticky tw-top-0 tw-bg-white tw-h-fit">
          <Tab
            eventKey={"dependencies"}
            title={
              <p
                title={
                  dependencyGraph.dependencies?.length === 0
                    ? "Lockfile provided does not contain any dependencies"
                    : ""
                }
                className={`tw-m-0 ${dependencyGraph.dependencies?.length === 0 && "tw-text-gray-500"}`}
              >
                Dependencies
              </p>
            }
          >
            <DependencyTree
              vulns={vulns ?? {}}
              dependencies={dependencyGraph.dependencies ?? dependencyGraph.graph.entryNodes()}
              packageInfo={packageInfo ?? {}}
              graph={dependencyGraph.graph}
              type="dependencies"
            />
          </Tab>
          {dependencyGraph.devDependencies && (
            <Tab
              eventKey={"devDependencies"}
              title={
                <p
                  title={
                    dependencyGraph.devDependencies.length === 0
                      ? "Lockfile provided does not contain any dependencies"
                      : ""
                  }
                  className={`tw-m-0 ${dependencyGraph.devDependencies.length === 0 && "tw-text-gray-500"}`}
                >
                  Dev Dependencies
                </p>
              }
            >
              <DependencyTree
                vulns={vulns ?? {}}
                packageInfo={packageInfo ?? {}}
                dependencies={dependencyGraph.devDependencies}
                graph={dependencyGraph.graph}
                type="dev dependencies"
              />
            </Tab>
          )}
        </Tabs>
      </Row>
    </>
  ) : (
    redirect("/")
  );
}
