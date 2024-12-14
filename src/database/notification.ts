import { runDbQuery, sql } from "./query.ts";
import { Notification } from "../models/notification.ts";

export function insertNewNotification(watchId: string) {
  return sql<Notification[]>`
    INSERT INTO notification("watchId")
        VALUES
            (${watchId})
                RETURNING *`;
}

export const getAllNotifications = () => runDbQuery(sql<Notification[]>`SELECT * FROM notification`);
