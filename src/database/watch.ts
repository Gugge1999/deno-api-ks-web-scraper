import { WatchAndNotificationDbRes, WatchDbRes } from "../models/watch-db-res.ts";
import { ScrapedWatch } from "../models/scraped-watches.ts";
import { runDbQuery, sql } from "./query.ts";
import { errorLogger } from "../services/logger.ts";
import { insertNewNotification } from "./notification.ts";
import { SerializableParameter } from "postgres";

export function getAllActiveWatches() {
  return runDbQuery(sql<WatchDbRes[]>`SELECT * FROM watch WHERE active = true ORDER BY added`);
}

export function deleteWatchById(id: string) {
  return runDbQuery(sql`DELETE FROM watch WHERE id = ${id}`);
}

export function toggleActiveStatus(ids: string[], active: boolean) {
  return runDbQuery(sql<WatchDbRes[]>`UPDATE watch SET active = ${active} WHERE id in ${sql(ids)} RETURNING *`);
}

export function saveWatch(label: string, watchToScrape: string, scrapedWatches: ScrapedWatch[]) {
  const newWatchQuery = sql<WatchDbRes[]>`
    INSERT INTO watch(label, watch_to_scrape, active, watches)
        VALUES
            (${label}, ${watchToScrape}, ${true}, ${scrapedWatches as unknown as SerializableParameter})
                RETURNING *`;

  return runDbQuery(newWatchQuery);
}

export function getWatchesAndNotifications() {
  return runDbQuery(sql<WatchAndNotificationDbRes[]>`
      select 
          watch.id,
          label,
          watches,
          active,
          watch_to_scrape,
          last_email_sent,
          added,
          last_changed,
          coalesce(array_remove(array_agg(sent), null), '{}') as notifications
      from watch
          left join notification on notification.watch_id = watch.id
      group by watch.id, added
      order by added;`);
}

export async function updateStoredWatches(newWatches: ScrapedWatch[], watchId: string) {
  return await sql.begin(async (sql) => {
    const watchQuery = sql<WatchDbRes[]>`
        UPDATE watch
            SET watches = ${newWatches as unknown as SerializableParameter}, last_email_sent = now()
                WHERE id = ${watchId}
                    RETURNING *`;

    const notificationQuery = insertNewNotification(watchId);

    const [watch, notification] = await Promise.all([runDbQuery(watchQuery), runDbQuery(notificationQuery)]);

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
