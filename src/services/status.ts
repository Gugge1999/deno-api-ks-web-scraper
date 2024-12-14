import process from "node:process";
import { difference } from "@std/datetime/difference";
import { ApiUptime } from "../models/status.dto.ts";

export function getUptime(): ApiUptime {
  const date = new Date();
  date.setSeconds(date.getSeconds() + process.uptime());

  const uptime = difference(new Date(), date);

  const milliseconds = uptime.milliseconds ?? 1;
  const totalSeconds = Math.floor(milliseconds / 1000);
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

  return {
    seconds,
    minutes,
    hours,
    days,
    months,
    years,
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
