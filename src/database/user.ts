import { runDbQuery, sql } from "./query.ts";
import { User } from "../models/user.ts";

export function insertNewUser(username: string, email: string, password: string) {
  const newUser = sql<User[]>`
    INSERT INTO app_user(username, email, password)
        VALUES
            (${username}, ${email}, ${password})
                RETURNING *`;

  return runDbQuery(newUser);
}

export function getUserByEmail(email: string) {
  return runDbQuery(sql<User[]>`SELECT * FROM app_user WHERE email = ${email}`);
}
