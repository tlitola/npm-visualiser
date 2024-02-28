import PackageInfoHeader from "@/components/dependencyTree/PackageInfoHeader";
import { ReactNode } from "react";

export default function ReportLayout({ children }: { children: ReactNode }) {
  return (
    <main className="tw-flex tw-h-screen tw-flex-col tw-items-center tw-bg-gray-50 tw-px-4 tw-py-16 ">
      <PackageInfoHeader />
      {children}
    </main>
  );
}
