import process from "node:process";
import { difference } from "@std/datetime/difference";
import { ApiUptime } from "../models/status.dto.ts";

export function getUptime(): ApiUptime {
  const date = new Date(); // get the current time
  date.setSeconds(date.getSeconds() + process.uptime());

  const uptime = difference(new Date(), date);

  const { milliseconds } = uptime;

  const hejsan = new Date(milliseconds ?? 0);

  return {
    seconds: hejsan.getUTCSeconds(),
    minutes: hejsan.getUTCMinutes(),
    hours: hejsan.getUTCHours(),
    // TODO: Fixa dessa sen. Utan lib
    days: 0,
    months: 0,
    years: 0,
  };
}

export function formatBytes(bytes: number) {
  if (!+bytes) {
    return 0;
  }

  const oneKb = 1024;

  const i = Math.floor(Math.log(bytes) / Math.log(oneKb));

  return Math.round(bytes / Math.pow(oneKb, i));
}
