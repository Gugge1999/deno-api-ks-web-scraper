import { runDbQuery, sql } from "./query.ts";
import { User } from "../models/user.ts";

export function insertNewUser(email: string, password: string) {
  const newUser = sql<User[]>`
    INSERT INTO app_user(email, password)
        VALUES
            (${email}, ${password})
                RETURNING *`;

  return runDbQuery(newUser);
}

// TODO: Ska den vara kvar?
// export function getUserByEmail(email: string) {
//   return runDbQuery(sql<User[]>`SELECT * FROM app_user WHERE email = ${email}`);
// }
