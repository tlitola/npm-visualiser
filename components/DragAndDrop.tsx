"use client"

import { faFileArrowDown, faCircleExclamation } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { ChangeEvent, DragEventHandler, useRef, useState } from "react"
import { Button, Card, CardBody, CardText, CardTitle } from "react-bootstrap"
export default function DragAndDrop({ onFileChange, disabled }: { disabled: boolean; onFileChange: (file: File, setError: (error?: string) => void) => void; }) {

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [droppable, setDroppable] = useState(false)
  const [error, setError] = useState<string>()

  const startWindowDrag: DragEventHandler = (e) => { e.preventDefault(); setDragging(true); setError(undefined) }
  const stopWindowDrag: DragEventHandler = (e) => { e.preventDefault(); setDragging(false) }
  const startDrag: DragEventHandler = (e) => { e.preventDefault(); setDroppable(true) }
  const stopDrag: DragEventHandler = (e) => { e.preventDefault(); setDroppable(false) }

  const handleDrop: DragEventHandler<HTMLInputElement> = (e) => {
    e.preventDefault()

    setDragging(false)
    setDroppable(false)

    if (!disabled && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileChange(e.dataTransfer.files[0], setError)
    }
  }

  const handleFileSubmit = (e: ChangeEvent<HTMLInputElement>) => {
    if (!disabled && fileInputRef.current?.files && fileInputRef.current.files.length > 0) {
      onFileChange(fileInputRef.current.files[0], setError)
    }
  }



  return (
    <>
      <div className={`${!dragging && "opacity-0"} z-0 transition-all  bg-black h-screen w-screen fixed top-0 left-0 opacity-20 ${droppable && "opacity-10"}`} onDragEnter={startWindowDrag} onDrop={stopWindowDrag} onDragOver={startWindowDrag} onDragLeave={stopWindowDrag} />
      <Card bg={`${(!droppable && !error) && "light"}`} border={`${error ? "danger" : !droppable ? "secondary" : "info"}`} className={`mx-auto w-3/5 ${error ? "!bg-rose-100" : "!bg-blue-100"} border-2 ${!droppable && "!border-dashed"} transition-all box-border`} onDragEnter={startDrag} onDragLeave={stopDrag} onDrop={handleDrop} onDragOver={(e) => { startDrag(e); startWindowDrag(e) }}>

        <CardBody className='text-center !space-y-3'>
          {/* The icon seems to cause shifting*/}
          <FontAwesomeIcon icon={faFileArrowDown} className={`w-24 h-24 m-auto`} />
          <CardTitle className={`${droppable && "!text-blue-600"} text-center m-0 transition-all`}>{`${!droppable ? "Drag and " : ""}Drop here`}</CardTitle>
          <CardText className={`${droppable && "text-blue-600"} text-center m-0`}>or</CardText>

          <input accept='.json' ref={fileInputRef} type="file" className='hidden' onChange={handleFileSubmit} />
          <Button disabled={disabled || (!error && droppable)} onClick={() => { fileInputRef.current?.click() }}>Choose a File</Button>
          <p className={`${!error && "hidden"} m-0 text-red-700`}><FontAwesomeIcon icon={faCircleExclamation} /> {error}</p>

        </CardBody >
      </Card >
    </>
  )
}