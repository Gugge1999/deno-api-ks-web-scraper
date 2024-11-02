import { Watch } from "./watch.ts";
import { ScrapedWatch } from "./scraped-watches.ts";

export type WatchDto = Omit<Watch, "watches"> & {
  watch: ScrapedWatch;
};
