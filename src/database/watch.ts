import { Watch } from "../models/watch.ts";
import { httpErrors } from "@oak/oak";
import { ScrapedWatch } from "../models/scraped-watches.ts";
import { runDbQuery, sql } from "./query.ts";
import { Notification } from "../models/notification.ts";
import { errorLogger } from "../services/logger.ts";

export const getAllWatches = () => runDbQuery(sql<Watch[]>`SELECT * FROM watch ORDER BY added`);
export const getAllActiveWatches = () => runDbQuery(sql<Watch[]>`SELECT * FROM watch WHERE active = true ORDER BY added`);
export const deleteWatchById = (id: string) => runDbQuery(sql`DELETE FROM watch WHERE id = ${id}`);
const getWatchById = (id: string) => runDbQuery(sql<Watch[]>`SELECT FROM watch WHERE id = ${id}`);

export async function toggleActiveStatus(isActive: boolean, id: string) {
  const watch = await getWatchById(id);

  if (watch.error || (watch.result && watch.result.length === 0)) {
    throw new httpErrors.InternalServerError(`Kunde inte hitta bevakning med id: ${id}`);
  }

  return runDbQuery(sql`UPDATE watch SET active = ${isActive} WHERE id = ${id}`);
}

export function saveWatch(label: string, watchToScrape: string, scrapedWatches: ScrapedWatch[]) {
  // TODO: Kom ihåg att lägga till clock_timestamp() i postgres migration på watch och notification

  const newWatchQuery = sql<Watch[]>`
    INSERT INTO watch(label, "watchToScrape", active, watches)
        VALUES
            (${label}, ${watchToScrape}, ${true}, ${JSON.stringify(scrapedWatches)})
                RETURNING *`;

  return runDbQuery(newWatchQuery);
}

export async function updateStoredWatches(newWatches: ScrapedWatch[], watchId: string) {
  return await sql.begin(async (sql) => {
    const [watch] = await sql<Watch[]>`
        UPDATE watch
            SET watches = (${JSON.stringify(newWatches)}), "lastEmailSent" = ${sql`now()`}
                WHERE id = ${watchId}
                    RETURNING *`;

    const [notification] = await sql<Notification[]>`
        INSERT INTO notification("watchId")
            VALUES
                (${watchId}) 
                     RETURNING *`;

    return {
      result: [watch, notification],
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
