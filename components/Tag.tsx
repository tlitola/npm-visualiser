import { CVSSThreadLevel } from "@/utils/client/utils";
import { faCircleExclamation, faRotateBack, faWarning } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ComponentPropsWithoutRef } from "react";
import { Badge } from "react-bootstrap";

export default function Tag({
  params,
  ...rest
}: {
  params:
    | { type: "version"; version: string }
    | { type: "warning"; message: string }
    | { type: "danger"; severity: CVSSThreadLevel }
    | { type: "circular" };
} & ComponentPropsWithoutRef<"div">) {
  let tag = <Badge></Badge>;

  switch (params.type) {
    case "version":
      const parts = params.version.split("-");
      tag = (
        <Badge {...rest} bg="light-gray" title={params.version}>
          {parts[0]}
          {parts.length > 1 && "..."}
        </Badge>
      );
      break;

    case "circular":
      tag = (
        <Badge
          {...rest}
          bg="emerald"
          text="dark"
          role="button"
          className="hover:!text-gray-500"
          title="This dependency creates a circular loop. Click here to go back to last instance of it"
        >
          <FontAwesomeIcon icon={faRotateBack} />
        </Badge>
      );
      break;

    case "warning":
      tag = (
        <div {...rest} title={params.message}>
          <FontAwesomeIcon icon={faWarning} />
        </div>
      );
      break;

    case "danger":
      tag = (
        <div
          {...rest}
          className={`text-vuln-${params.severity.toLowerCase()}`}
          title="This dependency has a known vulnerability. Click here to learn more"
        >
          <FontAwesomeIcon icon={faCircleExclamation} />
        </div>
      );
      break;

    default:
      break;
  }

  return tag;
}
