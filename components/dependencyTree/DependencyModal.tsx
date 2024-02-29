import { addMetricSuffix, capitalizeFirst, sortBySeverity } from "@/utils/client/utils";
import { faGithub, faNpm } from "@fortawesome/free-brands-svg-icons";
import { faHome } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { PropsWithChildren, useMemo, useState } from "react";
import { Accordion, CloseButton, Col, Modal, Row, Stack } from "react-bootstrap";
import Tag from "../Tag";
import dynamic from "next/dynamic";
import { useDependencyGraph } from "@/utils/hooks/useDependencyGraph";
import { useDependencyMetadata } from "@/utils/hooks/useDependencyMetadata";
import { NPM_BASE_URL, ThreatLevels } from "@/utils/constants/constants";

export default function DependencyModal({
  dependencyKey,
  show,
  hide,
}: {
  dependencyKey: string;
  show: boolean;
  hide: () => void;
}) {
  const graph = useDependencyGraph().graph;
  const dependency = graph.getNodeData(dependencyKey);

  const { dependencyInfo, vulnerabilities: allVulnerabilities } = useDependencyMetadata();
  const info = dependencyInfo[dependency.integrity];
  const vulnerabilities = allVulnerabilities[dependency.integrity] ?? [];

  const [downloads, setDownloads] = useState<[string, number]>(["Weekly downloads", NaN]);

  const DownloadsChart = useMemo(
    () =>
      dynamic(() => import("./DownloadsChart").then((module) => module.DownloadsChart), {
        ssr: false,
      }),
    [],
  );
  return (
    <Modal size="lg" show={show} onHide={hide}>
      <Modal.Header className="tw-flex tw-flex-col !tw-place-items-start tw-px-4 tw-pt-4">
        <Modal.Title className="!tw-text-3xl">
          {dependency.name}
          <Tag className="tw-ml-4 !tw-p-2" params={{ type: "version", version: dependency.version }} />
        </Modal.Title>
        <Stack direction="horizontal" gap={3} className="tw-mt-2">
          {info?.homepage && (
            <Link href={info?.homepage} target="_blank" className="tw-text-black hover:!tw-text-gray-600">
              <FontAwesomeIcon icon={faHome} className="tw-h-6" title="Homepage" />
            </Link>
          )}
          {info?.repository && (
            <Link
              href={info?.repository.replace("git+", "").replace("git://", "")}
              target="_blank"
              className="tw-text-black hover:!tw-text-gray-600"
            >
              <FontAwesomeIcon icon={faGithub} className="tw-h-6" title="Repository" />
            </Link>
          )}
          <Link
            href={NPM_BASE_URL + dependency.name ?? ""}
            target="_blank"
            className="tw-text-black hover:!tw-text-gray-600"
          >
            <FontAwesomeIcon icon={faNpm} className="tw-h-6" title="Homepage" />
          </Link>
        </Stack>
        <CloseButton className="tw-absolute tw-right-6 tw-top-6" onClick={hide} />
      </Modal.Header>
      <Modal.Body className="tw-max-h-[calc(94vh-41px-110px)] tw-overflow-scroll tw-px-4 tw-pb-4">
        <Row>
          <Col sm={7} className="tw-border-r-[1px] tw-border-r-gray-200">
            <ModalTitle>Description</ModalTitle>
            <p>{info?.description}</p>
            <ModalTitle>Dependencies</ModalTitle>
            <p>{graph.directDependenciesOf(dependencyKey).length}</p>
            <ModalTitle>Vulnerabilities ({vulnerabilities.length ?? 0})</ModalTitle>
            <div>
              <Accordion flush>
                {sortBySeverity(vulnerabilities).map((vulnerability, i) => (
                  <Accordion.Item key={vulnerability.id} eventKey={i.toString()}>
                    <Stack
                      key={vulnerability.id}
                      direction="horizontal"
                      className="tw-w-full tw-items-center tw-justify-between"
                    >
                      <p className="tw-my-auto">{vulnerability.id}</p>
                      <Stack direction="horizontal">
                        <p
                          className={`bg-vuln-${
                            vulnerability.severity?.text ?? ThreatLevels.Unknown
                          } tw-my-auto tw-mr-4 tw-rounded-lg tw-px-2 tw-py-[1px]`}
                        >
                          {capitalizeFirst(vulnerability.severity?.text ?? ThreatLevels.Unknown)}
                        </p>
                        <Accordion.Button className="tw-w-auto !tw-bg-transparent tw-p-0 !tw-shadow-none" />
                      </Stack>
                    </Stack>
                    <Accordion.Body className="tw-pt-1">
                      {vulnerability.to && (
                        <p className="tw-mb-1">
                          <b className="tw-text-gray-700">Affected versions:</b>{" "}
                          {vulnerability.from && (
                            <span title={vulnerability.from === "0" ? "The exact introduced commit is unknown" : ""}>
                              {vulnerability.from} -{" "}
                            </span>
                          )}
                          {vulnerability.to}
                        </p>
                      )}
                      <p className="tw-break-words">{vulnerability.details}</p>
                    </Accordion.Body>
                  </Accordion.Item>
                ))}
              </Accordion>
            </div>
          </Col>
          <Col sm={5}>
            <ModalTitle>{downloads[0]}</ModalTitle>
            <Stack direction={"horizontal"} className="!tw-mb-4 tw-h-[50px] tw-border-b-[1px] tw-border-b-gray-200">
              <p className="tw-mb-0 tw-mr-4 tw-mt-auto tw-w-1/2 tw-font-medium">{downloads[1]?.toLocaleString("en")}</p>
              <DownloadsChart packageName={dependency.name ?? ""} updateValue={setDownloads} />
            </Stack>
            <Row>
              <Col>
                <ModalTitle>License</ModalTitle>
                {info?.license ? <p>{info?.license}</p> : <p>-</p>}
              </Col>
              <Col>
                <ModalTitle>Unpacked size</ModalTitle>
                {info?.unpackedSize ? <p>{addMetricSuffix(info?.unpackedSize, "B")}</p> : <p>-</p>}
              </Col>
            </Row>
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer className="!tw-justify-start !tw-py-1">
        <i>
          Vulnerability data is sourced from{" "}
          <Link className="tw-text-black" href={"https://osv.dev/"} target="_blank">
            OSV API
          </Link>
        </i>
      </Modal.Footer>
    </Modal>
  );
}

function ModalTitle({ children }: PropsWithChildren) {
  return <h6 className="tw-mb-1 tw-text-gray-700">{children}</h6>;
}
