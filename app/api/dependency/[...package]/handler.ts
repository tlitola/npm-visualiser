import PackageInfoFetcher from "@/utils/server/packageInfoFetcher";
import { NextResponse } from "next/server";

export async function dependencyInfoHandler(fetcher: PackageInfoFetcher, params: { package: string[] }) {
  if (params.package.length < 2)
    return new NextResponse("Page not found", {
      status: 404,
    });

  const packageName = params.package.slice(0, params.package.length - 1).join("/");
  const version = params.package.at(-1) ?? "";
  const result = await fetcher.getPackageInfo(packageName, version);
  return NextResponse.json(result);
}
