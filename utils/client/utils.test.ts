import { describe, expect, test } from "vitest";
import {
  addMetricSuffix,
  calculateDownloadSize,
  findWorstVulnerability,
  getVulnerabilityCountText,
  getVulnerabilitySeverities,
  packageSizeMissing,
  sortBySeverity,
} from "./utils";
import { buildPackageInfoRecord, PackageInfoFactory } from "@/test/factories/packageInfoFactory";
import { buildVulnerabilitiesRecord, VulnerabilityFactory } from "@/test/factories/vulnerabilityFactory";
import { ThreatLevels } from "../constants/constants";

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
            text: ThreatLevels.High,
          },
        }),
      ],
      [VulnerabilityFactory.build()],
    );

    expect(findWorstVulnerability(vulns)).toEqual("High");
  });

  test("Returns unknown", () => {
    const vulns = buildVulnerabilitiesRecord([
      VulnerabilityFactory.build({
        severity: undefined,
      }),
    ]);

    expect(findWorstVulnerability(vulns)).toEqual("Unknown");
  });

  test("Returns safe", () => {
    expect(findWorstVulnerability({})).toEqual("Safe");
  });
});

describe("getVulnsCount", () => {
  test("Calculates correct number of vulnerabilities", () => {
    const vulns = buildVulnerabilitiesRecord(
      [
        VulnerabilityFactory.build({
          severity: {
            score: 7.4,
            text: ThreatLevels.High,
          },
        }),
        VulnerabilityFactory.build({
          severity: {
            score: 7.4,
            text: ThreatLevels.High,
          },
        }),
        VulnerabilityFactory.build({
          severity: {
            score: 7.4,
            text: ThreatLevels.Medium,
          },
        }),
      ],
      [VulnerabilityFactory.build()],
    );

    expect(getVulnerabilitySeverities(vulns)).toEqual({ high: 2, medium: 2 });
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

    expect(getVulnerabilitySeverities(vulns)).toEqual({ unknown: 1, medium: 1 });
  });
});

describe("getVulnsCountText", () => {
  test("Calculates correct number of vulnerabilities", () => {
    const vulns = buildVulnerabilitiesRecord(
      [
        VulnerabilityFactory.build({
          severity: {
            score: 7.4,
            text: ThreatLevels.High,
          },
        }),
      ],
      [VulnerabilityFactory.build()],
    );

    expect(getVulnerabilityCountText(vulns)).toEqual(
      "There are currently 0 Critical, 1 High, 1 Medium, 0 Low and 0 Unknown severity vulnerabilities",
    );
  });
});

describe("sortBySeverity  ", () => {
  test("Orders vulnerabilities correctly", () => {
    const vulns = [
      VulnerabilityFactory.build({
        severity: {
          text: ThreatLevels.Critical,
        },
      }),
      VulnerabilityFactory.build({
        severity: {
          text: ThreatLevels.High,
        },
      }),
      VulnerabilityFactory.build({
        severity: {
          text: ThreatLevels.Medium,
        },
      }),
      VulnerabilityFactory.build({
        severity: {
          text: ThreatLevels.Low,
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
