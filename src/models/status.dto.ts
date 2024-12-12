export interface ApiStatus {
  status: "active" | "inactive" | "pending";
  scrapingIntervalInMinutes: number;
  memoryUsage: number;
  uptime: ApiUptime;
}

export interface ApiUptime {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}
