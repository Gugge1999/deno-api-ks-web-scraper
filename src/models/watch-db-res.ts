/** OBS!: Den här har watches som string för att det är json i databasen  */
export interface WatchDbRes {
  id: string;
  watch_to_scrape: string;
  label: string;
  watches: string;
  active: boolean;
  last_email_sent: Date | null;
  added: Date;
}
