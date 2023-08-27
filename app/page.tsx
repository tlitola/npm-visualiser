import DependencyTree from '@/components/DependencyTree'
import DragAndDrop from '@/components/DragAndDrop'

export default function Home() {

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <DependencyTree />
    </main>
  )
}
