export interface Watch {
  id: string;
  watchToScrape: string;
  label: string;
  watches: string;
  active: boolean;
  lastEmailSent: Date | null;
  added: Date;
}
