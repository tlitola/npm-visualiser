"use client"

import { PackageLock } from "@/utils/PackageLock"
import { faFileArrowDown, faCircleExclamation } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { ChangeEvent, Dispatch, DragEventHandler, SetStateAction, useRef, useState } from "react"
import { Button, Card, CardBody, CardText, CardTitle } from "react-bootstrap"

export default function DragAndDrop({ file, setFile }: { file: PackageLock | undefined, setFile: Dispatch<SetStateAction<PackageLock | undefined>> }) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [droppable, setDroppable] = useState(false)
  const [error, setError] = useState<string>()

  const startWindowDrag: DragEventHandler = (e) => { e.preventDefault(); setDragging(true); setError(undefined) }
  const stopWindowDrag: DragEventHandler = (e) => { e.preventDefault(); setDragging(false) }
  const startDrag: DragEventHandler = (e) => { e.preventDefault(); setDroppable(true) }
  const stopDrag: DragEventHandler = (e) => { e.preventDefault(); setDroppable(false) }

  const maybeSetFile = (newFile: File) => {
    if (newFile?.type !== "application/json") return

    const reader = new FileReader()
    reader.readAsText(newFile)
    reader.onerror = () => setError(reader.error?.message)

    reader.onload = () => {
      if (!reader.result) return

      try {
        setError(undefined)
        setFile(JSON.parse(reader.result.toString()))
      } catch (error) {
        setError("Couldn't parse the file, please make sure it is valid JSON")
      }
    }
  }

  const handleDrop: DragEventHandler<HTMLInputElement> = (e) => {
    e.preventDefault()

    setDragging(false)
    setDroppable(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      maybeSetFile(e.dataTransfer.files[0])
    }
  }

  const handleFileSubmit = (e: ChangeEvent<HTMLInputElement>) => {
    if (fileInputRef.current?.files && fileInputRef.current.files.length > 0) {
      maybeSetFile(fileInputRef.current.files[0])
    }
  }



  return (
    <>
      <div className={`${!dragging && "opacity-0"} transition-all  bg-black h-screen w-screen fixed top-0 left-0 opacity-20 ${droppable && "opacity-10"}`} onDragEnter={startWindowDrag} onDrop={stopWindowDrag} onDragOver={startWindowDrag} onDragLeave={stopWindowDrag} />
      <Card bg={`${(!droppable && !error) && "light"}`} border={`${error ? "danger" : !droppable ? "secondary" : "info"}`} className={`w-3/5 ${error ? "!bg-rose-100" : "!bg-blue-100"} border-2 ${!droppable && "!border-dashed"} transition-all box-border`} onDragEnter={startDrag} onDragLeave={stopDrag} onDrop={handleDrop} onDragOver={(e) => { startDrag(e); startWindowDrag(e) }}>

        <CardBody className='text-center !space-y-3'>
          {/* The icon seems to cause shifting*/}
          <FontAwesomeIcon icon={faFileArrowDown} className={`w-24 h-24 m-auto`} />
          <CardTitle className={`${droppable && "!text-blue-600"} text-center m-0 transition-all`}>{`${!droppable ? "Drag and " : ""}Drop here`}</CardTitle>
          <CardText className={`${droppable && "text-blue-600"} text-center m-0`}>or</CardText>

          <input accept='.json' ref={fileInputRef} type="file" className='hidden' onChange={handleFileSubmit} />
          <Button disabled={!error && (!!file || droppable)} onClick={() => { fileInputRef.current?.click() }}>Choose a File</Button>
          <p className={`${!error && "hidden"} m-0 text-red-700`}><FontAwesomeIcon icon={faCircleExclamation} /> {error}</p>

        </CardBody >
      </Card >
    </>
  )
}