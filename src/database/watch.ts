import { WatchDbRes } from "../models/watch-db-res.ts";
import { ScrapedWatch } from "../models/scraped-watches.ts";
import { runDbQuery, sql } from "./query.ts";
import { errorLogger } from "../services/logger.ts";
import { insertNewNotification } from "./notification.ts";

export function getAllWatches() {
  return runDbQuery(sql<WatchDbRes[]>`SELECT * FROM watch ORDER BY added`);
}

export function getAllActiveWatches() {
  return runDbQuery(sql<WatchDbRes[]>`SELECT * FROM watch WHERE active = true ORDER BY added`);
}

export function deleteWatchById(id: string) {
  return runDbQuery(sql`DELETE FROM watch WHERE id = ${id}`);
}

// TODO: Om den här returnerar 0 rader betyder det att inga rader matchade ids
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

// TODO: Kolla att den här fortfarande fungerar
export async function updateStoredWatches(newWatches: ScrapedWatch[], watchId: string) {
  return await sql.begin(async (sql) => {
    console.time("stopwatch");

    const watchQuery = sql<WatchDbRes[]>`
        UPDATE watch
            SET watches = (${JSON.stringify(newWatches)}), last_email_sent = now()
                WHERE id = ${watchId}
                    RETURNING *`;

    const notificationQuery = insertNewNotification(watchId);

    const hejsan: { [k: string]: any } = ["hej"];

    hejsan[Object.keys({ notificationQuery })[0]] = notificationQuery;

    console.timeEnd("stopwatch");

    const [watch, notification] = await Promise.all([runDbQuery(watchQuery), notificationQuery]);

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

// export async function runSqlTransaction<T>(params: {key: string, query: string}[]) {
//   const hejsan: { [k: string]: any } = ["hej"];
//
//
//   const query = await sql.begin(async (sql) => {
//     let result: T[] = [];
//     for (const { key, query } of params) {
//       const res = await runDbQuery(sql<T[]>`${query}`);
//       result = [...result, ...res];
//     }
//     return result;
//   });
//
//
//   hejsan[Object.keys({ params.key })[0]] = query;
//
//   return {
//     result: hejsan,
//     error: null,
//   };
// }
