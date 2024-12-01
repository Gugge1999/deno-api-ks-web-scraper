// TODO: Kom ihåg att lägga till notification i migration
import { sql } from "./query.ts";
import { Notification } from "../models/notification.ts";

export function insertNewNotification(watchId: string) {
  // TODO: Kom ihåg att lägga till clock_timestamp() i postgres migration

  return sql<Notification[]>`
    INSERT INTO notification("watchId")
        VALUES
            (${watchId})
                RETURNING *`;
}
