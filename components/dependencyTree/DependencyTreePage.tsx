"use client";

import { Row, Tab, Tabs } from "react-bootstrap";
import useSWR from "swr";
import DTPageHeader from "./DTPageHeader";
import DependencyTree from "./DependencyTree";
import { redirect } from "next/navigation";
import { getPackageNameAndVersion } from "@/utils/client/utils";
import { fetchAllPackagesInfo, fetchAllPackagesVulnerabilites } from "@/utils/client/fetchers";

export default function DependencyTreePage() {
  const { data: dependencyTree } = useSWR("dependencyTree", { revalidateOnFocus: false });

  const { data: packageInfo } = useSWR(
    "packageInfo",
    () => fetchAllPackagesInfo(getPackageNameAndVersion(dependencyTree)),
    { revalidateOnFocus: false },
  );
  const { data: vulns } = useSWR(
    "packageVulnerability",
    () => fetchAllPackagesVulnerabilites(getPackageNameAndVersion(dependencyTree)),
    { revalidateOnFocus: false },
  );

  return dependencyTree ? (
    <>
      <DTPageHeader vulns={vulns} packageInfo={packageInfo} dependencyTree={dependencyTree} />
      <Row className="tw-w-full tw-h-full tw-overflow-y-scroll tw-p-2 tw-py-0 tw-rounded-sm tw-shadow tw-content-start tw-scroll-pt-24 tw-scroll-smooth">
        <Tabs defaultActiveKey={"dependencies"} className="tw-sticky tw-top-0 tw-bg-white tw-h-fit">
          <Tab
            eventKey={"dependencies"}
            title={
              <p
                title={dependencyTree.tree.length === 0 ? "Lockfile provided does not contain any dependencies" : ""}
                className={`tw-m-0 ${dependencyTree.tree.length === 0 && "tw-text-gray-500"}`}
              >
                Dependencies
              </p>
            }
          >
            <DependencyTree
              vulns={vulns ?? {}}
              packageInfo={packageInfo ?? {}}
              tree={dependencyTree.tree}
              type="dependencies"
            />
          </Tab>
          <Tab
            eventKey={"devDependencies"}
            title={
              <p
                title={dependencyTree.devTree.length === 0 ? "Lockfile provided does not contain any dependencies" : ""}
                className={`tw-m-0 ${dependencyTree.devTree.length === 0 && "tw-text-gray-500"}`}
              >
                Dev Dependencies
              </p>
            }
          >
            <DependencyTree
              vulns={vulns ?? {}}
              packageInfo={packageInfo ?? {}}
              tree={dependencyTree.devTree}
              type="dev dependencies"
            />
          </Tab>
        </Tabs>
      </Row>
    </>
  ) : (
    redirect("/")
  );
}
