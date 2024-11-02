// @deno-types="npm:@types/luxon@^3.4.2"
import { DateTime } from "npm:luxon@^3.5.0";

// Tabell över format: https://moment.github.io/luxon/#/formatting

/** Format: yyyy-MM-dd hh:mm:ss */
export function dateAndTime() {
  return DateTime.now().toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS);
}

/** Format: hh:mm:ss */
export function time() {
  return DateTime.now().toLocaleString(DateTime.TIME_24_WITH_SECONDS);
}
