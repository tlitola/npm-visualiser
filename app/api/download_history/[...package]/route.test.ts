import { describe, expect, test } from "vitest";
import { mock } from "vitest-mock-extended";
import { downloadHistoryHandler } from "./handler";
import PackageInfoFetcher from "@/utils/server/packageInfoFetcher";

describe("GET download history", () => {
  test("Fails if no package is specified", async () => {
    const response = await downloadHistoryHandler(mock(), { package: [] });
    expect(response.status).toEqual(404);
  });

  test("", async () => {
    const responseBody = {
      package: "bootstrap",
      downloads: [],
    };
    const fetcher = mock<PackageInfoFetcher>();
    fetcher.getPackageDownloadHistory.mockImplementation(async () => responseBody);

    const response = await downloadHistoryHandler(fetcher, { package: ["bootstrap"] });
    expect(response.status).toEqual(200);
    expect(await response.json()).toEqual(responseBody);
  });
});
