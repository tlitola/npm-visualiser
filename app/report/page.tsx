import DependencyTreePage from "@/components/dependencyTree/DependencyTreePage";

export default function Home() {
  return (
    <main className="flex h-screen flex-col px-4 py-16 items-center bg-gray-50 ">
      <DependencyTreePage />
    </main>
  );
}
