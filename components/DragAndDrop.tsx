import { faFileArrowDown, faCircleExclamation } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { DragEventHandler, useEffect, useRef, useState } from "react";
import { Button, Card, CardBody, CardText, CardTitle } from "react-bootstrap";
import Loading from "@/components/loading/Loading";

export default function DragAndDrop({
  onFileInput,
  className,
  loading,
}: {
  onFileInput: (file: File, setError: (error?: string) => void) => void;
  className?: string;
  loading: boolean;
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

    if (!loading && e.dataTransfer.files && e.dataTransfer.files.length !== 0) {
      onFileInput(e.dataTransfer.files[0], setError);
    }
  };

  const handleFileSubmit = () => {
    if (!loading && fileInputRef.current?.files && fileInputRef.current.files.length > 0) {
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
          !loading && !dragging && "tw-hidden "
        } tw-fixed tw-left-0 tw-top-0 tw-z-0 tw-h-screen tw-w-screen tw-bg-black tw-opacity-20 tw-transition-all ${
          !loading && droppable && "!tw-opacity-10"
        } tw-pointer-events-none`}
      />
      <Card
        border={`${error ? "danger" : !droppable ? "secondary" : "info"}`}
        className={`tw-mx-auto tw-w-3/5 ${
          error ? "!tw-bg-rose-100" : !loading && droppable ? "!tw-bg-blue-100" : "!tw-bg-white"
        } tw-border-2 ${
          loading
            ? "border-transparent"
            : !droppable
            ? dragging
              ? "!tw-border-dashed"
              : "border-transparent"
            : "!tw-border-solid"
        } tw-box-border tw-p-3 tw-shadow tw-transition-all ${className}`}
        onDragEnter={startDrag}
        onDragLeave={stopDrag}
        onDrop={handleDrop}
        onDragOver={(e) => {
          startDrag(e);
          startWindowDrag(e);
        }}
      >
        {!loading ? (
          <CardBody className="tw-flex tw-h-72 tw-flex-col tw-items-center tw-justify-center !tw-space-y-3">
            <FontAwesomeIcon icon={faFileArrowDown} className={`tw-m-auto tw-h-24 tw-w-24`} />
            <CardTitle className={`${droppable && "!tw-text-blue-600"} tw-m-0 tw-transition-all`}>{`${
              !droppable ? "Drag and " : ""
            }Drop here to start`}</CardTitle>
            <CardText className={`${droppable && "tw-text-blue-600"} m-0`}>or</CardText>

            <input accept=".json" ref={fileInputRef} type="file" className="tw-hidden" onChange={handleFileSubmit} />
            <Button
              className="!tw-font-semibold"
              disabled={!error && droppable}
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
        ) : (
          <CardBody className="tw-flex tw-h-72 tw-flex-col tw-items-center tw-justify-center">
            <h2 className="tw-mb-2 tw-w-[310px] tw-font-bold tw-text-slate-700 after:tw-inline-block after:tw-w-0 after:tw-animate-dots after:tw-overflow-hidden after:tw-align-bottom after:tw-content-['…']">
              Parsing the lockfile
            </h2>
            <p className="!tw-mb-10  tw-text-xl tw-font-medium tw-text-slate-700">
              This should only take a few seconds
            </p>
            <Loading />
          </CardBody>
        )}
      </Card>
    </>
  );
}
