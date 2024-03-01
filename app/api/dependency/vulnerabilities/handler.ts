import PackageInfoFetcher from "@/utils/server/packageInfoFetcher";
import { NextRequest, NextResponse } from "next/server";
import { withDependenciesHandler } from "@/utils/server/handlers";
import { ZodError } from "zod";

export async function vulnerabilityHandler(fetcher: PackageInfoFetcher, request: NextRequest) {
  try {
    const data = await withDependenciesHandler(
      (name, version) => fetcher.getPackageVulnerabilities(name, version),
      request,
    );
    return NextResponse.json(data);
  } catch (e) {
    if (e instanceof ZodError) return NextResponse.json({ e }, { status: 400 });
    return NextResponse.json("Internal server error", { status: 500 });
  }
}
