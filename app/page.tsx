"use client"
import DragAndDrop from '@/components/DragAndDrop'
import { PackageLock } from '@/utils/PackageLock'
import { useState } from 'react'

export default function Home() {
  const [file, setFile] = useState<PackageLock>()

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <DragAndDrop file={file} setFile={setFile} />
    </main>
  )
}
