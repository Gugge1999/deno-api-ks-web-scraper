import process from "node:process";
import { ApiUptime } from "../models/status.dto.ts";

export function getUptime(): ApiUptime {
  const now = Temporal.Now.instant();
  const uptimeSeconds = Math.floor(process.uptime());

  const start = now.subtract({ seconds: uptimeSeconds });

  const duration = start.until(now, { largestUnit: "hours" });

  const totalSeconds = duration.hours * 3600 +
    duration.minutes * 60 +
    duration.seconds;

  const totalMinutes = Math.floor(totalSeconds / 60);
  const totalHours = Math.floor(totalMinutes / 60);
  const totalDays = Math.floor(totalHours / 24);
  const totalMonths = Math.floor(totalDays / 30);
  const years = Math.floor(totalDays / 365);

  const seconds = totalSeconds % 60;
  const minutes = totalMinutes % 60;
  const hours = totalHours % 24;
  const days = totalDays % 30;
  const months = totalMonths % 12;

  return { seconds, minutes, hours, days, months, years };
}

export function formatBytes(bytes: number) {
  if (!+bytes) {
    return 0;
  }

  const oneKb = 1024;

  const i = Math.floor(Math.log(bytes) / Math.log(oneKb));

  return Math.round(bytes / Math.pow(oneKb, i));
}
