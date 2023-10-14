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
      <Modal.Header className="flex flex-col !place-items-start px-4 pt-4">
        <Modal.Title className="!text-3xl">
          {dependency.name}
          <Tag className="ml-4 p-2" params={{ type: "version", version: dependency.version ?? "" }} />
        </Modal.Title>
        <Stack direction="horizontal" gap={3} className="mt-2">
          {info?.homepage && (
            <Link href={info?.homepage} target="_blank" className="text-black hover:!text-gray-600">
              <FontAwesomeIcon icon={faHome} className="h-6" title="Homepage" />
            </Link>
          )}
          {info?.repository && (
            <Link href={info?.repository.split("git+")[1]} target="_blank" className="text-black hover:!text-gray-600">
              <FontAwesomeIcon icon={faGithub} className="h-6" title="Repository" />
            </Link>
          )}
          <Link href={baseLink + dependency.name} target="_blank" className="text-black hover:!text-gray-600">
            <FontAwesomeIcon icon={faNpm} className="h-6" title="Homepage" />
          </Link>
        </Stack>
        <CloseButton className="absolute right-6 top-6" onClick={hide} />
      </Modal.Header>
      <Modal.Body className="px-4 pb-4">
        <Row>
          <Col sm={7} className="border-r-[1px] border-r-gray-200">
            <ModalTitle>Description</ModalTitle>
            <p>{info?.description}</p>
            <ModalTitle>Dependencies</ModalTitle>
            <p>{dependency.totalDependencies}</p>
            <ModalTitle>Vulnerabilities ({vulns?.length ?? 0})</ModalTitle>
            <div>
              <Accordion flush>
                {sortBySeverity(vulns)?.map((el, i) => (
                  <Accordion.Item key={el.id} eventKey={i.toString()}>
                    <Stack key={el.name} direction="horizontal" className="justify-between w-full items-center">
                      <p className="my-auto">{el.id}</p>
                      <Stack direction="horizontal">
                        {el?.severity?.text && (
                          <p
                            className={`bg-vuln-${
                              el.severity?.text ?? "Unknown"
                            } py-[1px] px-2 rounded-lg my-auto mr-4`}
                          >
                            {capitalizeFirst(el.severity?.text)}
                          </p>
                        )}
                        <Accordion.Button className="w-auto shadow-none bg-transparent p-0" />
                      </Stack>
                    </Stack>
                    <Accordion.Body className="pt-1">
                      {el.to && (
                        <p className="mb-1">
                          <b className="text-gray-700">Affected versions:</b>{" "}
                          {el.from && (
                            <span title={el.from === "0" ? "The exact introduced commit is unknown" : ""}>
                              {el.from} -{" "}
                            </span>
                          )}
                          {el.to}
                        </p>
                      )}
                      <p className="break-words">{el.details}</p>
                    </Accordion.Body>
                  </Accordion.Item>
                ))}
              </Accordion>
            </div>
          </Col>
          <Col sm={5}>
            <ModalTitle>{(downloads ?? defaultDownloads)[0]}</ModalTitle>
            <Stack direction={"horizontal"} className="border-b-[1px] h-[50px] border-b-gray-200 !mb-4">
              <p className="mr-4 mt-auto mb-0 font-medium w-2/5">
                {(downloads ?? defaultDownloads)[1]?.toLocaleString("en")}
              </p>
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
      <Modal.Footer className="!justify-start !py-1">
        <i>
          Vulnerability data is sourced from{" "}
          <Link className="text-black" href={"https://osv.dev/"} target="_blank">
            OSV API
          </Link>
        </i>
      </Modal.Footer>
    </Modal>
  );
}

function ModalTitle({ children }: PropsWithChildren) {
  return <h6 className="text-gray-700 mb-1">{children}</h6>;
}
