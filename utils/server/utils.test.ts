import { describe, expect, test } from "vitest";
import { getNpmDateRange, getWeeklyDownloads } from "./utils";
import downloadHistory from "../../test/fixtures/npm_download_history.json";
import { npmDownloadsResponse } from "./packageInfoFetcher";

describe("getNpmDateRange", () => {
  test("Returns right string", () => {
    //Oct 14 2023
    const date = new Date(1697230800000);
    expect(getNpmDateRange(date)).toEqual("2022-10-15:2023-10-14");
  });
});

describe("getWeeklyDownloads", () => {
  const history = npmDownloadsResponse.parse(downloadHistory);

  test("Has right number of download entries", () => {
    expect(getWeeklyDownloads(history)).toHaveLength(51);
  });

  test("Calculates weekly downloads correctly", () => {
    expect(getWeeklyDownloads(history)[0]).toHaveProperty("downloads", 4441903);
  });
  test("Correctly identifies weeks", () => {
    expect(getWeeklyDownloads(history)[0]).toHaveProperty("week", "2022-10-23 to 2022-10-29");
  });

  test("Works when first entry starts the search", () => {
    expect(getWeeklyDownloads({ ...history, downloads: history.downloads.slice(7) })).toHaveLength(50);
  });
});
