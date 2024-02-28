import { faFileArrowDown, faCircleExclamation } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { DragEventHandler, useEffect, useRef, useState } from "react";
import { Button, Card, CardBody, CardText, CardTitle } from "react-bootstrap";

export default function DragAndDrop({
  onFileInput,
  disabled,
  className,
}: {
  disabled: boolean;
  onFileInput: (file: File, setError: (error?: string) => void) => void;
  className?: string;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [droppable, setDroppable] = useState(false);
  const [error, setError] = useState<string>();

  const startWindowDrag: DragEventHandler = (e) => {
    e.preventDefault();
    setDragging(true);
    setError(undefined);
  };
  const stopWindowDrag: DragEventHandler = (e) => {
    e.preventDefault();
    setDragging(false);
  };
  const startDrag: DragEventHandler = (e) => {
    e.preventDefault();
    setDroppable(true);
  };
  const stopDrag: DragEventHandler = (e) => {
    e.preventDefault();
    setDroppable(false);
  };

  const handleDrop: DragEventHandler<HTMLInputElement> = (e) => {
    e.preventDefault();

    setDragging(false);
    setDroppable(false);

    if (!disabled && e.dataTransfer.files && e.dataTransfer.files.length === 0) {
      onFileInput(e.dataTransfer.files[0], setError);
    }
  };

  const handleFileSubmit = () => {
    if (!disabled && fileInputRef.current?.files && fileInputRef.current.files.length > 0) {
      onFileInput(fileInputRef.current.files[0], setError);
    }
  };

  useEffect(() => {
    //@ts-expect-error Typings of the window.addEventListener and DragEventHandler seems to give unnecessary error.
    window.addEventListener("dragenter", startWindowDrag);
    //@ts-expect-error Typings of the window.addEventListener and DragEventHandler seems to give unnecessary error.
    window.addEventListener("drop", stopWindowDrag);
    //@ts-expect-error Typings of the window.addEventListener and DragEventHandler seems to give unnecessary error.
    window.addEventListener("dragover", startWindowDrag);
    //@ts-expect-error Typings of the window.addEventListener and DragEventHandler seems to give unnecessary error.
    window.addEventListener("dragleave", stopWindowDrag);

    return () => {
      //@ts-expect-error Typings of the window.addEventListener and DragEventHandler seems to give unnecessary error.
      window.removeEventListener("dragenter", startWindowDrag);
      //@ts-expect-error Typings of the window.removeEventListener and DragEventHandler seems to give unnecessary error.
      window.removeEventListener("drop", stopWindowDrag);
      //@ts-expect-error Typings of the window.removeEventListener and DragEventHandler seems to give unnecessary error.
      window.removeEventListener("dragover", startWindowDrag);
      //@ts-expect-error Typings of the window.removeEventListener and DragEventHandler seems to give unnecessary error.
      window.removeEventListener("dragleave", stopWindowDrag);
    };
  }, []);

  return (
    <>
      <div
        className={`${
          !dragging && "tw-hidden "
        } tw-fixed tw-left-0 tw-top-0 tw-z-0 tw-h-screen tw-w-screen tw-bg-black tw-opacity-20 tw-transition-all ${
          droppable && "tw-opacity-10"
        } tw-pointer-events-none`}
      />
      <Card
        border={`${error ? "danger" : !droppable ? "secondary" : "info"}`}
        className={`tw-mx-auto tw-w-3/5 ${
          error ? "!tw-bg-rose-100" : droppable ? "!tw-bg-blue-100" : "!tw-bg-white"
        } tw-border-2 ${
          !droppable ? (dragging ? "!tw-border-dashed" : "border-transparent") : "!tw-border-solid"
        } tw-box-border tw-p-3 tw-shadow tw-transition-all ${className}`}
        onDragEnter={startDrag}
        onDragLeave={stopDrag}
        onDrop={handleDrop}
        onDragOver={(e) => {
          startDrag(e);
          startWindowDrag(e);
        }}
      >
        <CardBody className="!tw-space-y-3 tw-text-center">
          {/* The icon seems to cause shifting*/}
          <FontAwesomeIcon icon={faFileArrowDown} className={`tw-m-auto tw-h-24 tw-w-24`} />
          <CardTitle className={`${droppable && "!tw-text-blue-600"} tw-m-0 tw-text-center tw-transition-all`}>{`${
            !droppable ? "Drag and " : ""
          }Drop here to start`}</CardTitle>
          <CardText className={`${droppable && "tw-text-blue-600"} m-0 tw-text-center`}>or</CardText>

          <input accept=".json" ref={fileInputRef} type="file" className="tw-hidden" onChange={handleFileSubmit} />
          <Button
            className="!tw-font-semibold"
            disabled={disabled || (!error && droppable)}
            onClick={() => {
              fileInputRef.current?.click();
            }}
          >
            Choose a File
          </Button>
          <p className={`${!error && "tw-hidden"} tw-m-0 tw-text-red-700`}>
            <FontAwesomeIcon icon={faCircleExclamation} /> {error}
          </p>
        </CardBody>
      </Card>
    </>
  );
}
