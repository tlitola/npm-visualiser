import { faRotateBack, faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ComponentProps, ComponentPropsWithoutRef } from "react";
import { Badge } from "react-bootstrap";

export default function Tag({ type, ...rest }: { type: "circular" | "danger" } & ComponentPropsWithoutRef<"div">) {
  let tag = <Badge></Badge>

  switch (type) {
    case "circular":
      tag =
        <Badge {...rest} bg="info" text="dark" role="button" className="ml-3 hover:!text-gray-500" title="This dependency creates a circular loop. Click here to go back to last instance of it">
          <FontAwesomeIcon icon={faRotateBack} />
        </Badge>
      break;

    case "danger":
      tag = <Badge {...rest} bg="danger" className="ml-3" title="This dependency has known vulnerability. Click here to learn more">
        <FontAwesomeIcon icon={faTriangleExclamation} />
      </Badge>
      break

    default:
      break;
  }

  return tag
}