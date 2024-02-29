"use client";

import { Row, Tab, Tabs } from "react-bootstrap";
import DependencyTree from "@/components/dependencyTree/DependencyTree";
import { useDependencyGraph } from "@/utils/hooks/useDependencyGraph";

export default function DependencyPanel() {
  const dependencyGraph = useDependencyGraph();

  return (
    <Row className="tw-h-full tw-w-full tw-scroll-pt-24 tw-content-start tw-overflow-y-scroll tw-scroll-smooth tw-rounded-sm tw-p-2 tw-py-0 tw-shadow">
      <Tabs defaultActiveKey={"dependencies"} className="tw-sticky tw-top-0 tw-h-fit tw-bg-white">
        <Tab
          eventKey={"dependencies"}
          title={
            <p
              title={
                dependencyGraph.dependencies?.length === 0 ? "Lockfile provided does not contain any dependencies" : ""
              }
              className={`tw-m-0 ${dependencyGraph.dependencies?.length === 0 && "tw-text-gray-500"}`}
            >
              Dependencies
            </p>
          }
        >
          <DependencyTree
            dependencies={dependencyGraph.dependencies ?? dependencyGraph.graph.entryNodes()}
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
                    ? "Lockfile provided does not contain any dev dependencies"
                    : ""
                }
                className={`tw-m-0 ${dependencyGraph.devDependencies.length === 0 && "tw-text-gray-500"}`}
              >
                Dev Dependencies
              </p>
            }
          >
            <DependencyTree dependencies={dependencyGraph.devDependencies} type="dev dependencies" />
          </Tab>
        )}
      </Tabs>
    </Row>
  );
}
