import { faRotateBack, faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ComponentPropsWithoutRef } from "react";
import { Badge } from "react-bootstrap";

export default function Tag({ type, version, ...rest }: ({ type: "version"; version: string } | { type: "circular" | "danger"; version?: undefined }) & ComponentPropsWithoutRef<"div">) {
  let tag = <Badge></Badge>

  switch (type) {
    case "version":
      const parts = version.split("-")
      tag =
        <Badge {...rest} bg="light-gray" title={version}>
          {parts[0]}{parts.length > 1 && "..."}
        </Badge>
      break;

    case "circular":
      tag =
        <Badge {...rest} bg="emerald" text="dark" role="button" className="hover:!text-gray-500" title="This dependency creates a circular loop. Click here to go back to last instance of it">
          <FontAwesomeIcon icon={faRotateBack} />
        </Badge>
      break;

    case "danger":
      tag = <Badge {...rest} bg="danger" title="This dependency has known vulnerability. Click here to learn more">
        <FontAwesomeIcon icon={faTriangleExclamation} />
      </Badge>
      break

    default:
      break;
  }

  return tag
}