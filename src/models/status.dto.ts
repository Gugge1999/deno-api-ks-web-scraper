import type { DurationObjectUnits } from "npm:@types/luxon@^3.4.2";

export interface ApiStatus {
  status: "active" | "inactive" | "pending";
  scrapingIntervalInMinutes: number;
  memoryUsage: string;
  uptime: DurationObjectUnits;
}
