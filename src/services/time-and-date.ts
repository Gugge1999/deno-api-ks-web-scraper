import { format } from "jsr:@std/datetime";

/** Format: yyyy-MM-dd hh:mm:ss */
export function dateAndTime() {
  return format(new Date(), "yyyy-MM-dd HH:mm:ss");
}

/** Format: hh:mm:ss */
export function time() {
  return format(new Date(), "HH:mm:ss");
}
