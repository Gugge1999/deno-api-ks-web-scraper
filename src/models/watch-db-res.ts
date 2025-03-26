import { ScrapedWatch } from "./scraped-watches.ts";

export interface WatchDbRes {
  id: string;
  watch_to_scrape: string;
  label: string;
  watches: ScrapedWatch[];
  active: boolean;
  last_email_sent: Date | null;
  added: Date;
}
