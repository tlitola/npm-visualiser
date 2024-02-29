export const NPM_BASE_URL = "https://www.npmjs.com/package/" as const;

export const VULNERABILITY_SEVERITY_ORDER: Record<CVSSThreatLevel, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
  unknown: 4,
  safe: 5,
};

export enum ThreatLevels {
  "Low" = "low",
  "Medium" = "medium",
  "High" = "high",
  "Critical" = "critical",
  "Unknown" = "unknown",
  "Safe" = "safe",
}

export type CVSSThreatLevel = `${ThreatLevels}`;
