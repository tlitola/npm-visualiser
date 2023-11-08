import DependencyTreePage from "@/components/dependencyTree/DependencyTreePage";

export default function Home() {
  return (
    <main className="tw-flex tw-h-screen tw-flex-col tw-px-4 tw-py-16 tw-items-center tw-bg-gray-50 ">
      <DependencyTreePage />
    </main>
  );
}
