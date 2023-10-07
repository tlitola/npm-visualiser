import { disconnectCache, initializeCache } from "@/utils/server/cache";
import PackageInfoFetcher from "@/utils/server/packageInfoFetcher";
import { NextResponse } from "next/server";

export async function GET(_request: any, { params }: { params: { package: string[] } }) {
  if (params.package.length < 2)
    return new NextResponse("Page not found", {
      status: 404,
    });

  const packageName = params.package.slice(0, params.package.length - 1).join("/");
  const version = params.package.at(-1) ?? "";

  const cache = await initializeCache();
  const fetcher = new PackageInfoFetcher(cache);
  const result = await fetcher.getPackageVulnerabilities(packageName, version);

  disconnectCache(cache);

  return NextResponse.json(result);
}
