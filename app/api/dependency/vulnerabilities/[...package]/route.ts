import { handleWithCache } from "@/utils/server/cache";
import PackageInfoFetcher from "@/utils/server/packageInfoFetcher";
import { NextRequest } from "next/server";
import { vulnerabilityHandler } from "./handler";

export const GET = async (request: NextRequest, { params }: { params: { package: string[] } }) =>
  handleWithCache((cache) => {
    const fetcher = new PackageInfoFetcher(cache);
    return vulnerabilityHandler(fetcher, params);
  });
