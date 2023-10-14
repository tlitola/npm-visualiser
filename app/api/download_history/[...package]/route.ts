import { disconnectCache, initializeCache } from "@/utils/server/cache";
import PackageInfoFetcher from "@/utils/server/packageInfoFetcher";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: { package: string[] } }) {
  if (params.package.length < 1)
    return new NextResponse("Page not found", {
      status: 404,
    });

  const packageName = params.package.join("/");

  const cache = await initializeCache();
  const fetcher = new PackageInfoFetcher(cache);
  const result = await fetcher.getPackageDownloadHistory(packageName);

  disconnectCache(cache);

  return NextResponse.json(result);
}
