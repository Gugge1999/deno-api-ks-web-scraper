import { format } from "jsr:@std/datetime";

/** Format: `yyyy-MM-dd hh:mm:ss.SSS` */
export const currentDateAndTime = (): string => format(new Date(), "yyyy-MM-dd HH:mm:ss.SSS");

/** Format: `hh:mm:ss` */
export const currentTime = (): string => format(new Date(), "HH:mm:ss");
