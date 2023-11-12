import { PackageInfo, PackageVulnerability } from "@/utils/Package";
import { NpmPackage } from "@/utils/PackageLock";
import { capitalizeFirst, sortBySeverity, addMetricSuffix } from "@/utils/client/utils";
import { faGithub, faNpm } from "@fortawesome/free-brands-svg-icons";
import { faHome } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { PropsWithChildren, useMemo, useState } from "react";
import { Accordion, CloseButton, Col, Modal, Row, Stack } from "react-bootstrap";
import Tag from "../Tag";
import dynamic from "next/dynamic";

export default function DepepndencyModal({
  dependency,
  show,
  info,
  vulns,
  hide,
}: {
  dependency: NpmPackage;
  info?: PackageInfo;
  vulns: PackageVulnerability[];
  show: boolean;
  hide: () => void;
}) {
  const defaultDownloads = useMemo(() => ["Weekly downloads", info?.downloads] as [string, number], [info]);
  const [downloads, setDownloads] = useState<[string, number] | undefined>(undefined);

  const DownloadsChart = useMemo(
    () =>
      dynamic(() => import("./DownloadsChart").then((module) => module.DownloadsChart), {
        ssr: false,
      }),
    [],
  );

  const baseLink = "https://www.npmjs.com/package/";
  return (
    <Modal size="lg" show={show} onHide={hide}>
      <Modal.Header className="tw-flex tw-flex-col !tw-place-items-start tw-px-4 tw-pt-4">
        <Modal.Title className="!tw-text-3xl">
          {dependency.name}
          <Tag className="tw-ml-4 !tw-p-2" params={{ type: "version", version: dependency.version ?? "" }} />
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
            href={baseLink + dependency.name ?? ""}
            target="_blank"
            className="tw-text-black hover:!tw-text-gray-600"
          >
            <FontAwesomeIcon icon={faNpm} className="tw-h-6" title="Homepage" />
          </Link>
        </Stack>
        <CloseButton className="tw-absolute tw-right-6 tw-top-6" onClick={hide} />
      </Modal.Header>
      <Modal.Body className="tw-px-4 tw-pb-4 tw-overflow-scroll tw-max-h-[calc(94vh-41px-110px)]">
        <Row>
          <Col sm={7} className="tw-border-r-[1px] tw-border-r-gray-200">
            <ModalTitle>Description</ModalTitle>
            <p>{info?.description}</p>
            <ModalTitle>Dependencies</ModalTitle>
            <p>{dependency.totalDependencies}</p>
            <ModalTitle>Vulnerabilities ({vulns?.length ?? 0})</ModalTitle>
            <div>
              <Accordion flush>
                {sortBySeverity(vulns)?.map((el, i) => (
                  <Accordion.Item key={el.id} eventKey={i.toString()}>
                    <Stack
                      key={el.name}
                      direction="horizontal"
                      className="tw-justify-between tw-w-full tw-items-center"
                    >
                      <p className="tw-my-auto">{el.id}</p>
                      <Stack direction="horizontal">
                        {el?.severity?.text && (
                          <p
                            className={`bg-vuln-${
                              el.severity?.text ?? "Unknown"
                            } tw-py-[1px] tw-px-2 tw-rounded-lg tw-my-auto tw-mr-4`}
                          >
                            {capitalizeFirst(el.severity?.text)}
                          </p>
                        )}
                        <Accordion.Button className="tw-w-auto !tw-shadow-none !tw-bg-transparent tw-p-0" />
                      </Stack>
                    </Stack>
                    <Accordion.Body className="tw-pt-1">
                      {el.to && (
                        <p className="tw-mb-1">
                          <b className="tw-text-gray-700">Affected versions:</b>{" "}
                          {el.from && (
                            <span title={el.from === "0" ? "The exact introduced commit is unknown" : ""}>
                              {el.from} -{" "}
                            </span>
                          )}
                          {el.to}
                        </p>
                      )}
                      <p className="tw-break-words">{el.details}</p>
                    </Accordion.Body>
                  </Accordion.Item>
                ))}
              </Accordion>
            </div>
          </Col>
          <Col sm={5}>
            <ModalTitle>{downloads[0]}</ModalTitle>
            <Stack direction={"horizontal"} className="tw-border-b-[1px] tw-h-[50px] tw-border-b-gray-200 !tw-mb-4">
              <p className="tw-mr-4 tw-mt-auto tw-mb-0 tw-font-medium tw-w-1/2">{downloads[1]?.toLocaleString("en")}</p>
              <DownloadsChart packageName={dependency.name ?? ""} updateValue={setDownloads} />
            </Stack>
            <Row>
              <Col>
                <ModalTitle>License</ModalTitle>
                <p>{info?.license}</p>
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
  return <h6 className="tw-text-gray-700 tw-mb-1">{children}</h6>;
}
