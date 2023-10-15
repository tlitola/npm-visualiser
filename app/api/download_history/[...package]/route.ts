import { handleWithCache } from "@/utils/server/cache";
import PackageInfoFetcher from "@/utils/server/packageInfoFetcher";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (request: NextRequest, { params }: { params: { package: string[] } }) =>
  handleWithCache((cache) => {
    const fetcher = new PackageInfoFetcher(cache);
    return downloadHistoryHandler(fetcher, params);
  });

export async function downloadHistoryHandler(fetcher: PackageInfoFetcher, params: { package: string[] }) {
  if (params.package.length < 1)
    return new NextResponse("Page not found", {
      status: 404,
    });

  const packageName = params.package.join("/");
  const result = await fetcher.getPackageDownloadHistory(packageName);
  return NextResponse.json(result);
}
