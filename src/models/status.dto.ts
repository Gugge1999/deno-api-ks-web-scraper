import type { DurationObjectUnits } from "npm:@types/luxon@^3.4.2";

export interface ApiStatus {
  active: true;
  scrapingIntervalInMinutes: number;
  memoryUsage: string;
  uptime: DurationObjectUnits;
}
