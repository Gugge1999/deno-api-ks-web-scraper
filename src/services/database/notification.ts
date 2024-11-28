// TODO: Kom ihåg att lägga till notification i migration
import { runDbQuery, sql } from "./query.ts";

export function insertNewNotification(watchId: string) {
  // TODO: Kom ihåg att lägga till clock_timestamp() i postgres migration

  const newNotificationQuery = sql`
    INSERT INTO notification("watchId")
    VALUES
    (${watchId})`;

  return runDbQuery(newNotificationQuery);
}
