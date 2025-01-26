import { WatchDbRes } from "./watch-db-res.ts";
import { ScrapedWatch } from "./scraped-watches.ts";

export type WatchDto = Pick<WatchDbRes, "id" | "label" | "added" | "active"> & {
  latestWatch: ScrapedWatch;
  watchToScrape: string;
  lastEmailSent: Date | null;
};

export interface WatchAndNotificationDto extends WatchDto {
  notifications: Date[];
}
