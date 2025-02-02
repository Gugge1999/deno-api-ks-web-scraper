import { WatchDbRes } from "../models/watch-db-res.ts";
import { ScrapedWatch } from "../models/scraped-watches.ts";
import { runDbQuery, sql } from "./query.ts";
import { errorLogger } from "../services/logger.ts";
import { insertNewNotification } from "./notification.ts";

export const getAllWatches = () => runDbQuery(sql<WatchDbRes[]>`SELECT * FROM watch ORDER BY added`);

export const getAllActiveWatches = () => runDbQuery(sql<WatchDbRes[]>`SELECT * FROM watch WHERE active = true ORDER BY added`);

export const deleteWatchById = (id: string) => runDbQuery(sql`DELETE FROM watch WHERE id = ${id}`);

// TODO: Gör om den här till en transaktion ifall någon ids inte finns. Det kanske också är bra att göra en generell funktion med transaktion.
export function toggleActiveStatus(ids: string[], active: boolean) {
  return runDbQuery(sql<WatchDbRes[]>`UPDATE watch SET active = ${active} WHERE id in ${sql(ids)} RETURNING *`);
}

export function saveWatch(label: string, watchToScrape: string, scrapedWatches: ScrapedWatch[]) {
  const newWatchQuery = sql<WatchDbRes[]>`
    INSERT INTO watch(label, watch_to_scrape, active, watches)
        VALUES
            (${label}, ${watchToScrape}, ${true}, ${JSON.stringify(scrapedWatches)})
                RETURNING *`;

  return runDbQuery(newWatchQuery);
}

export async function updateStoredWatches(newWatches: ScrapedWatch[], watchId: string) {
  return await sql.begin(async (sql) => {
    const [watch] = await sql<WatchDbRes[]>`
        UPDATE watch
            SET watches = (${JSON.stringify(newWatches)}), last_email_sent = now()
                WHERE id = ${watchId}
                    RETURNING *`;

    const [notification] = await insertNewNotification(watchId);

    return {
      result: { watch, notification },
      error: null,
    };
  }).catch((err: unknown) => {
    errorLogger.error({
      message: "Transaktion för att uppdatera bevakning misslyckades.",
      stacktrace: err,
    });

    return {
      result: null,
      error: err,
    };
  });
}
