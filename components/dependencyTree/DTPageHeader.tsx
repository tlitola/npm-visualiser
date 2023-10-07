import { Row, Col, Stack, Card } from "react-bootstrap";
import Tag from "../Tag";
import { NpmPackage, ProjectInfo } from "@/utils/PackageLock";
import {
  calculateDownloadSize,
  calculateTotalDependencyCount,
  capitalizeFirst,
  findWorstVuln,
  getVulnsCountText,
  packageSizeMissing,
} from "@/utils/client/utlis";
import { PackageInfo, PackageVulnerability } from "@/utils/Package";
import { faWarning } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function DTPageHeader({
  project,
  dependencyTree,
  packageInfo,
  vulns,
}: {
  packageInfo: Record<string, PackageInfo>;
  vulns: Record<string, PackageVulnerability[]>;
  project?: ProjectInfo;
  dependencyTree: {
    tree: NpmPackage[];
    devTree: NpmPackage[];
    dependencyCount: number;
  };
}) {
  return (
    <Row className="mb-4">
      <Col>
        <Stack direction="horizontal" className="mb-1">
          <h1 className="my-auto mr-4">{project?.name}</h1>
          {project?.version && (
            <Tag
              className="px-2 py-1  !text-base"
              params={{ type: "version", version: project?.version }}
            />
          )}
        </Stack>
        <h4>Something</h4>
      </Col>

      <Col>
        <Stack className="justify-end" direction="horizontal" gap={4}>
          <Card
            className="!h-32 !w-32 py-2"
            title={`This package has ${
              dependencyTree.dependencyCount
            } unique dependencies, ${
              dependencyTree.tree.length + dependencyTree.devTree.length
            } of which are direct. Transitively, the package has ${
              calculateTotalDependencyCount(dependencyTree.tree) +
              calculateTotalDependencyCount(dependencyTree.devTree)
            } dependencies.`}
          >
            <Card.Title className="!text-base text-center font-normal mb-0">
              Dependencies
            </Card.Title>
            <Card.Body className="text-center font-bold">
              {dependencyTree.dependencyCount}
            </Card.Body>
            <Card.Footer className="font-light text-sm text-center mt-[1px]">{`Direct: ${
              dependencyTree.tree.length + dependencyTree.devTree.length
            }`}</Card.Footer>
          </Card>
          <Card className="!h-32 !w-32 py-2" title={getVulnsCountText(vulns)}>
            <Card.Title className="!text-base text-center font-normal mb-0">
              Vulnerabilities
            </Card.Title>
            <Card.Body className="text-center font-bold">
              {Object.keys(vulns).length}
            </Card.Body>
            <Card.Footer
              className={`font-light text-sm text-center bg-vuln-${findWorstVuln(
                vulns
              ).toLowerCase()} mt-[1px]`}
            >
              {capitalizeFirst(findWorstVuln(vulns))}
            </Card.Footer>
          </Card>
          <Card
            className="!h-32 !w-32 py-2"
            title="Size of all dependencies combined"
          >
            <Card.Title className="!text-base text-center font-normal mb-0">
              Download size
            </Card.Title>
            <Card.Body className="m-auto text-center font-bold flex flex-row items-center">
              {calculateDownloadSize(packageInfo)}
              {packageSizeMissing(packageInfo) && (
                <FontAwesomeIcon
                  title="Couldn't find the size of some packages"
                  className="ml-2"
                  icon={faWarning}
                />
              )}
            </Card.Body>
            <Card.Footer className="font-light text-sm text-center mt-[1px]">
              Unpacked
            </Card.Footer>
          </Card>
        </Stack>
      </Col>
    </Row>
  );
}
