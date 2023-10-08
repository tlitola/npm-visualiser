import { PackageInfo, PackageVulnerability } from "@/utils/Package";
import { NpmPackage } from "@/utils/PackageLock";
import { CloseButton, Col, Modal, Row, Stack } from "react-bootstrap";
import Tag from "../Tag";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome } from "@fortawesome/free-solid-svg-icons";
import { faGithub, faNpm } from "@fortawesome/free-brands-svg-icons";
import Link from "next/link";
import { PropsWithChildren } from "react";

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
      <Modal.Body className="px-4">
        <Row className="border-b-gray-200 border-b-[1px]">
          <Col sm={7}>
            <ModalTitle>Description</ModalTitle>
            <p>{info?.description}</p>
            <ModalTitle>Dependencies</ModalTitle>
            <p>{dependency.totalDependencies}</p>
            <ModalTitle>Vulnerabilities</ModalTitle>
            <div>
              {vulns?.map((el) => (
                <p className="break-words" key={el.name}>
                  {el.details}
                </p>
              ))}
            </div>
          </Col>
          <Col sm={5}>
            <p>Weekly downloads</p>
          </Col>
        </Row>
      </Modal.Body>
    </Modal>
  );
}

function ModalTitle({ children }: PropsWithChildren) {
  return <h5>{children}</h5>;
}
