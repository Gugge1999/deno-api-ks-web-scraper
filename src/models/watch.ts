import type { DateTime } from "npm:@types/luxon@^3.4.2";
import { ScrapedWatch } from "./scraped-watches.ts";

export interface Watch {
  id: string;
  watchToScrape: string;
  label: string;
  watches: ScrapedWatch[];
  active: boolean;
  lastEmailSent: Date | null;
  added: DateTime;
}
