import { Row, Col, Stack, Card } from "react-bootstrap";
import Tag from "../Tag";
import {
  calculateDownloadSize,
  capitalizeFirst,
  findWorstVuln,
  getVulnsCount,
  getVulnsCountText,
  packageSizeMissing,
} from "@/utils/client/utils";
import { PackageInfo, PackageVulnerability } from "@/utils/Package";
import { faWarning } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { DependencyGraph } from "./LockfileInput";
import Link from "next/link";

export default function DTPageHeader({
  dependencyGraph,
  packageInfo,
  vulns,
}: {
  packageInfo?: Record<string, PackageInfo>;
  vulns?: Record<string, PackageVulnerability[]>;
  dependencyGraph: DependencyGraph;
}) {
  return (
    <Row className="tw-mb-6 tw-w-full">
      <Col>
        <Stack direction="horizontal" className="tw-mb-1">
          <h1 className="tw-my-auto tw-mr-4">{dependencyGraph?.name}</h1>
          {dependencyGraph?.version && (
            <Tag
              className="!tw-px-2 !tw-py-1 !tw-text-base"
              params={{ type: "version", version: dependencyGraph?.version }}
            />
          )}
        </Stack>
        <Link href="/" className="tw-ml-1 tw-font-medium tw-text-black">
          Process another lockfile
        </Link>
      </Col>

      <Col className="!tw-pr-0">
        <Stack className="tw-justify-end" direction="horizontal" gap={4}>
          <Card
            className="!tw-h-32 tw-w-32"
            title={`This package has ${dependencyGraph.graph.size()} unique dependencies, ${
              dependencyGraph.graph.entryNodes().length
            } of which are direct. Transitively, the package has ${dependencyGraph.graph.size()} dependencies.`}
          >
            <Card.Title className="!-tw-mb-2 !tw-mt-2  tw-text-center !tw-text-base">Dependencies</Card.Title>
            <Card.Body className="tw-mt-2 tw-text-center">{dependencyGraph.graph.size()}</Card.Body>
            <Card.Footer className="tw-mt-[1px] tw-text-center tw-text-sm tw-font-light">{`Direct: ${
              dependencyGraph.graph.entryNodes().length
            }`}</Card.Footer>
          </Card>
          <Card className="!tw-h-32 tw-w-32" title={vulns && getVulnsCountText(vulns)}>
            <Card.Title className="!-tw-mb-2 !tw-mt-2 tw-text-center !tw-text-base">Vulnerabilities</Card.Title>
            <Card.Body className="tw-mt-2 tw-text-center">
              {vulns ? getVulnsCount(vulns) : <Skeleton className="!tw-w-3/4" />}
            </Card.Body>
            <Card.Footer
              className={`bg-vuln- tw-text-center tw-text-sm tw-font-light${findWorstVuln(
                vulns ?? {},
              ).toLowerCase()} tw-mt-[1px]`}
            >
              {vulns ? capitalizeFirst(findWorstVuln(vulns)) : <Skeleton className="!tw-w-3/4" />}
            </Card.Footer>
          </Card>
          <Card className="!tw-h-32 tw-w-32 " title="Size of all dependencies combined">
            <Card.Title className="!-tw-mb-2 !tw-mt-2 tw-text-center !tw-text-base">Download size</Card.Title>
            <Card.Body
              className={`text-center  tw-mt-2 ${
                packageInfo && "tw-mx-auto tw-flex tw-flex-row tw-items-center tw-px-0"
              }`}
            >
              {packageInfo ? calculateDownloadSize(packageInfo) : <Skeleton className="!tw-w-3/4" />}
              {packageSizeMissing(packageInfo ?? {}) && (
                <FontAwesomeIcon title="Couldn't find the size of some packages" className="tw-ml-2" icon={faWarning} />
              )}
            </Card.Body>
            <Card.Footer className="tw-mt-[1px] tw-text-center tw-text-sm tw-font-light">Unpacked</Card.Footer>
          </Card>
        </Stack>
      </Col>
    </Row>
  );
}
