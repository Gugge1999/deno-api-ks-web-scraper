// @deno-types="npm:@types/luxon@^3.4.2"
import { DateTime } from "npm:luxon@^3.5.0";

// Tabell över format: https://moment.github.io/luxon/#/formatting

/** Format: yyyy-MM-dd hh:mm:ss */
export const dateAndTime = () => DateTime.now().toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS);

/** Format: hh:mm:ss */
export const time = () => DateTime.now().toLocaleString(DateTime.TIME_24_WITH_SECONDS);

export function getUptime() {
  const currentTimePlusUptime = DateTime.now().plus({
    seconds: Deno.osUptime(),
  });

  const currentTime = DateTime.now();

  const uptime = currentTimePlusUptime.diff(currentTime, ["years", "months", "days", "hours", "minutes", "seconds"]);

  const uptimeObj = uptime.toObject();

  uptimeObj.seconds = Math.round(uptimeObj.seconds ?? 0);
  return uptimeObj;
}
