import process from "node:process";
// @deno-types="npm:@types/luxon@^3.4.2"
import { DateTime } from "@luxon";
import { DurationObjectUnits } from "npm:@types/luxon@3.4.2";

export function getUptime(): DurationObjectUnits {
  const currentTimePlusUptime = DateTime.now().plus({
    seconds: process.uptime(),
  });

  const currentTime = DateTime.now();

  const uptime = currentTimePlusUptime.diff(currentTime, [
    "years",
    "months",
    "days",
    "hours",
    "minutes",
    "seconds",
  ]);

  const uptimeObj = uptime.toObject();

  return {
    ...uptimeObj,
    seconds: Math.round(uptimeObj.seconds ?? 0), // Radera decimaler
  };
}

export function formatBytes(bytes: number, decimals: number) {
  if (!+bytes) {
    return "0 Bytes";
  }

  const oneKb = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes: readonly string[] = ["Bytes", "kB", "MB", "GB"];

  const i = Math.floor(Math.log(bytes) / Math.log(oneKb));

  return `${parseFloat((bytes / Math.pow(oneKb, i)).toFixed(dm))} ${sizes[i]}`;
}
