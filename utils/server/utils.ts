import { parseCvssVector } from "vuln-vects";

export const getVulnerabilitySeverity = (vector: string) => {
  return parseCvssVector(vector).cvss3OverallSeverityText;
};

export const getVulnerabilityScore = (vector: string) => {
  return parseCvssVector(vector).baseScore;
};
