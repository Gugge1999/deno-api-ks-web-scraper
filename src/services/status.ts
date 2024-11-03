import process from "node:process";
// @deno-types="npm:@types/luxon@^3.4.2"
import { DateTime } from "npm:luxon@^3.5.0";

export function getUptime() {
  const currentTimePlusUptime = DateTime.now().plus({
    seconds: process.uptime(),
  });

  const currentTime = DateTime.now();

  const uptime = currentTimePlusUptime.diff(currentTime, ["years", "months", "days", "hours", "minutes", "seconds"]);

  const uptimeObj = uptime.toObject();

  return {
    ...uptimeObj,
    // Avrunda decimaler, default är väldigt många
    seconds: Math.round(uptimeObj.seconds ?? 0),
  };
}

export function formatBytes(bytes: number, decimals: number) {
  if (!+bytes) {
    return "0 Bytes";
  }

  const oneKb = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes: ReadonlyArray<string> = ["Bytes", "kB", "MB", "GB"];

  const i = Math.floor(Math.log(bytes) / Math.log(oneKb));

  return `${parseFloat((bytes / Math.pow(oneKb, i)).toFixed(dm))} ${sizes[i]}`;
}
