import PackageInfoFetcher from "@/utils/server/packageInfoFetcher";
import { NextResponse } from "next/server";

export async function downloadHistoryHandler(fetcher: PackageInfoFetcher, params: { package: string[] }) {
  if (params.package.length < 1)
    return new NextResponse("Page not found", {
      status: 404,
    });

  const packageName = params.package.join("/");
  const result = await fetcher.getPackageDownloadHistory(packageName);
  return NextResponse.json(result);
}
