import { describe, expect, test } from "vitest";
import {
  addMetricSuffix,
  calculateDownloadSize,
  findWorstVuln,
  getVulnCounts,
  getVulnsCountText,
  packageSizeMissing,
  sortBySeverity,
} from "./utils";
import { buildPackageInfoRecord, PackageInfoFactory } from "@/test/factories/packageInfoFactory";
import { buildVulnerabilitiesRecord, VulnerabilityFactory } from "@/test/factories/vulnerabilityFactory";

describe("addMetricSuffix", () => {
  test("Adds correct suffix", () => {
    expect(addMetricSuffix(1000)).toEqual("1.00K");
  });
  test("Adds correct suffix", () => {
    expect(addMetricSuffix(1000000)).toEqual("1.00M");
  });
});

test.each([
  [100, undefined, "100.00"],
  [1000, undefined, "1.00K"],
  [1000000, "B", "1.00MB"],
  [1200000, "B", "1.20MB"],
])("addMetricSuffix(%f, %s) -> %s", (value, suffix, result) => {
  expect(addMetricSuffix(value, suffix)).toEqual(result);
});

describe("calculateDownloadSize", () => {
  test("Gives correct sum", () => {
    const packages = buildPackageInfoRecord(
      PackageInfoFactory.build({ unpackedSize: 1000 }),
      PackageInfoFactory.build({ unpackedSize: 1211 }),
    );
    expect(calculateDownloadSize(packages)).toEqual("2.21KB");
  });

  test("Adds correct suffix", () => {
    const packages = buildPackageInfoRecord(
      PackageInfoFactory.build({ unpackedSize: 1e6 }),
      PackageInfoFactory.build({ unpackedSize: 121100 }),
    );
    expect(calculateDownloadSize(packages)).toEqual("1.12MB");
  });
});

describe("packageSizeMissing", () => {
  test("Returns false if all packages have size", () => {
    const packages = buildPackageInfoRecord(
      PackageInfoFactory.build({ unpackedSize: 1000 }),
      PackageInfoFactory.build({ unpackedSize: 1211 }),
    );
    expect(packageSizeMissing(packages)).toBe(false);
  });

  test("Returns true if any package doesn't have size", () => {
    const packages = buildPackageInfoRecord(
      PackageInfoFactory.build({ unpackedSize: undefined }),
      PackageInfoFactory.build({ unpackedSize: 1211 }),
    );
    expect(packageSizeMissing(packages)).toBe(true);
  });
});

describe("findWorstVuln", () => {
  test("Finds worst vulnerability", () => {
    const vulns = buildVulnerabilitiesRecord(
      [
        VulnerabilityFactory.build({
          severity: {
            score: 7.4,
            text: "High",
          },
        }),
      ],
      [VulnerabilityFactory.build()],
    );

    expect(findWorstVuln(vulns)).toEqual("High");
  });

  test("Returns unknown", () => {
    const vulns = buildVulnerabilitiesRecord([
      VulnerabilityFactory.build({
        severity: undefined,
      }),
    ]);

    expect(findWorstVuln(vulns)).toEqual("Unknown");
  });

  test("Returns safe", () => {
    expect(findWorstVuln({})).toEqual("Safe");
  });
});

describe("getVulnsCount", () => {
  test("Calculates correct number of vulnerabilities", () => {
    const vulns = buildVulnerabilitiesRecord(
      [
        VulnerabilityFactory.build({
          severity: {
            score: 7.4,
            text: "High",
          },
        }),
        VulnerabilityFactory.build({
          severity: {
            score: 7.4,
            text: "High",
          },
        }),
        VulnerabilityFactory.build({
          severity: {
            score: 7.4,
            text: "Medium",
          },
        }),
      ],
      [VulnerabilityFactory.build()],
    );

    expect(getVulnCounts(vulns)).toEqual({ High: 2, Medium: 2 });
  });
  test("Works with unknown severity", () => {
    const vulns = buildVulnerabilitiesRecord(
      [
        VulnerabilityFactory.build({
          severity: {
            text: undefined,
          },
        }),
      ],
      [VulnerabilityFactory.build()],
    );

    expect(getVulnCounts(vulns)).toEqual({ Unknown: 1, Medium: 1 });
  });
});

describe("getVulnsCountText", () => {
  test("Calculates correct number of vulnerabilities", () => {
    const vulns = buildVulnerabilitiesRecord(
      [
        VulnerabilityFactory.build({
          severity: {
            score: 7.4,
            text: "High",
          },
        }),
      ],
      [VulnerabilityFactory.build()],
    );

    expect(getVulnsCountText(vulns)).toEqual(
      "There are currently 0 Critical, 1 High, 1 Medium, 0 Low and 0 Unknown severity vulnerabilities",
    );
  });
});

describe("sortBySeverity  ", () => {
  test("Calculates total dependency count correctly", () => {
    const vulns = [
      VulnerabilityFactory.build({
        severity: {
          text: "Critical",
        },
      }),
      VulnerabilityFactory.build({
        severity: {
          text: "High",
        },
      }),
      VulnerabilityFactory.build({
        severity: {
          text: "Medium",
        },
      }),
      VulnerabilityFactory.build({
        severity: {
          text: "Low",
        },
      }),
      VulnerabilityFactory.build({
        severity: {
          text: undefined,
        },
      }),
    ];

    expect(sortBySeverity(shuffleArray([...vulns]))).toEqual(vulns);
  });
});

/* Randomize array in-place using Durstenfeld shuffle algorithm and return reference to the same array*/
const shuffleArray = <T>(array: T[]): T[] => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
};
