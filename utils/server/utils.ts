import { parseCvssVector } from "vuln-vects";
import { z } from "zod";
import { npmDownloadsResponse } from "./packageInfoFetcher";

export const getVulnerabilitySeverity = (vector: string) => {
  return parseCvssVector(vector).cvss3OverallSeverityText;
};

export const getVulnerabilityScore = (vector: string) => {
  return parseCvssVector(vector).baseScore;
};

const year = 1000 * 60 * 60 * 24 * 364;
export const getNpmDateRange = (date: Date) => {
  const startDate = new Date(date.getTime() - year);
  return `${startDate.getFullYear()}-${startDate.getMonth() + 1}-${startDate.getDate()}:${date.getFullYear()}-${
    date.getMonth() + 1
  }-${date.getDate()}`;
};

export const getWeeklyDownloads = (
  downloads: z.infer<typeof npmDownloadsResponse>,
): { week: string; downloads: number }[] => {
  const startIndex = downloads.downloads.findIndex((el) => new Date(el.day).getDay() === 0);

  const result = [];

  for (let i = startIndex; i < downloads.downloads.length - 6; i += 7) {
    const weeklyDownloads = downloads.downloads.slice(i, i + 7).reduce((acc, el) => (acc += el.downloads), 0);
    result.push({
      week: `${downloads.downloads[i].day} to ${downloads.downloads[i + 6].day}`,
      downloads: weeklyDownloads,
    });
  }

  return result;
};
