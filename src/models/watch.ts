/** OBS!: Den här har watches som string för att det är json i databasen  */
export interface Watch {
  id: string;
  watchToScrape: string;
  label: string;
  watches: string;
  active: boolean;
  lastEmailSent: Date | null;
  added: Date;
}
