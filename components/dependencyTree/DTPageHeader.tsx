import { Row, Col, Stack, Card } from "react-bootstrap";
import Tag from "../Tag";
import { NpmPackage, ProjectInfo } from "@/utils/PackageLock";
import { calculateDownloadSize, packageSizeMissing } from "@/utils/client/utlis";
import { PackageInfo } from "@/utils/Package";
import { faWarning } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function DTPageHeader({ project, dependencyTree, packageInfo }: { packageInfo: Record<string, PackageInfo>; project?: ProjectInfo; dependencyTree: { tree: NpmPackage[], devTree: NpmPackage[], peerTree: NpmPackage[] } }) {

  return (
    <Row className="mb-4">
      <Col>
        <Stack direction="horizontal" className="mb-1"><h1 className="my-auto mr-4">{project?.name}</h1>{project?.version && <Tag className="px-2 py-1  !text-base" params={{ type: "version", version: project?.version }} />}</Stack>
        <h4>Something</h4>
      </Col>

      <Col>
        <Stack className="justify-end" direction="horizontal" gap={4}>
          <Card className="!h-32 !w-32 py-2" title="23 dependencies, 10 dev dependencies and 2 peer dependencies">
            <Card.Title className="!text-base text-center font-normal mb-0">Dependencies</Card.Title>
            <Card.Body className="text-center font-bold">{dependencyTree.tree.length + dependencyTree.devTree.length + dependencyTree.peerTree.length}</Card.Body>
            <Card.Footer className="font-light text-sm text-center">{`${dependencyTree.tree.length} / ${dependencyTree.devTree.length} / ${dependencyTree.peerTree.length}`}</Card.Footer>
          </Card>
          <Card className="!h-32 !w-32 py-2" title="There are currently 0 high, 1 medium, and 0 low severity vulnerabilites">
            <Card.Title className="!text-base text-center font-normal mb-0">Vulnerabilities</Card.Title>
            <Card.Body className="text-center font-bold">1</Card.Body>
            <Card.Footer className="font-light text-sm text-center">Medium</Card.Footer>
          </Card>
          <Card className="!h-32 !w-32 py-2" title="Size of all dependencies combined">
            <Card.Title className="!text-base text-center font-normal mb-0">Download size</Card.Title>
            <Card.Body className="m-auto text-center font-bold flex flex-row items-center">
              {calculateDownloadSize(packageInfo)}
              {packageSizeMissing(packageInfo) && <FontAwesomeIcon title="Couldn't find the size of some packages" className="ml-2" icon={faWarning} />}
            </Card.Body>
            <Card.Footer className="font-light text-sm text-center">Unpacked</Card.Footer>
          </Card>
        </Stack>
      </Col>
    </Row>
  )
}
