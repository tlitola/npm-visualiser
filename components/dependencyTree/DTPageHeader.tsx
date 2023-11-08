import { Row, Col, Stack, Card } from "react-bootstrap";
import Tag from "../Tag";
import {
  calculateDownloadSize,
  calculateTotalDependencyCount,
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
import { DependencyTreeInterface } from "./LockfileInput";
import Link from "next/link";

export default function DTPageHeader({
  dependencyTree,
  packageInfo,
  vulns,
}: {
  packageInfo?: Record<string, PackageInfo>;
  vulns?: Record<string, PackageVulnerability[]>;
  dependencyTree: DependencyTreeInterface;
}) {
  return (
    <Row className="tw-mb-6 tw-w-full">
      <Col>
        <Stack direction="horizontal" className="tw-mb-1">
          <h1 className="tw-my-auto tw-mr-4">{dependencyTree?.name}</h1>
          {dependencyTree?.version && (
            <Tag
              className="!tw-px-2 !tw-py-1 !tw-text-base"
              params={{ type: "version", version: dependencyTree?.version }}
            />
          )}
        </Stack>
        <Link href="/" className="tw-text-black tw-ml-1 tw-font-medium">
          Process another lockfile
        </Link>
      </Col>

      <Col className="!tw-pr-0">
        <Stack className="tw-justify-end" direction="horizontal" gap={4}>
          <Card
            className="!tw-h-32 tw-w-32"
            title={`This package has ${dependencyTree.dependencyCount} unique dependencies, ${
              dependencyTree.tree.length + dependencyTree.devTree.length
            } of which are direct. Transitively, the package has ${
              calculateTotalDependencyCount(dependencyTree.tree) + calculateTotalDependencyCount(dependencyTree.devTree)
            } dependencies.`}
          >
            <Card.Title className="!tw-text-base tw-text-center  !-tw-mb-2 !tw-mt-2">Dependencies</Card.Title>
            <Card.Body className="tw-text-center tw-mt-2">{dependencyTree.dependencyCount}</Card.Body>
            <Card.Footer className="tw-font-light tw-text-sm tw-text-center tw-mt-[1px]">{`Direct: ${
              dependencyTree.tree.length + dependencyTree.devTree.length
            }`}</Card.Footer>
          </Card>
          <Card className="!tw-h-32 tw-w-32" title={vulns && getVulnsCountText(vulns)}>
            <Card.Title className="!tw-text-base tw-text-center !-tw-mb-2 !tw-mt-2">Vulnerabilities</Card.Title>
            <Card.Body className="tw-text-center tw-mt-2">
              {vulns ? getVulnsCount(vulns) : <Skeleton className="!tw-w-3/4" />}
            </Card.Body>
            <Card.Footer
              className={`tw-font-light tw-text-sm tw-text-center bg-vuln-${findWorstVuln(
                vulns ?? {},
              ).toLowerCase()} tw-mt-[1px]`}
            >
              {vulns ? capitalizeFirst(findWorstVuln(vulns)) : <Skeleton className="!tw-w-3/4" />}
            </Card.Footer>
          </Card>
          <Card className="!tw-h-32 tw-w-32 " title="Size of all dependencies combined">
            <Card.Title className="!tw-text-base tw-text-center !-tw-mb-2 !tw-mt-2">Download size</Card.Title>
            <Card.Body
              className={`text-center  tw-mt-2 ${
                packageInfo && "tw-flex tw-flex-row tw-items-center tw-px-0 tw-mx-auto"
              }`}
            >
              {packageInfo ? calculateDownloadSize(packageInfo) : <Skeleton className="!tw-w-3/4" />}
              {packageSizeMissing(packageInfo ?? {}) && (
                <FontAwesomeIcon title="Couldn't find the size of some packages" className="tw-ml-2" icon={faWarning} />
              )}
            </Card.Body>
            <Card.Footer className="tw-font-light tw-text-sm tw-text-center tw-mt-[1px]">Unpacked</Card.Footer>
          </Card>
        </Stack>
      </Col>
    </Row>
  );
}
