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

export function getUserByUsername(username: string) {
  return runDbQuery(sql<User[]>`SELECT * FROM app_user WHERE username = ${username}`);
}

export function getUserById(id: string) {
  return runDbQuery(sql<User[]>`SELECT * FROM app_user WHERE id = ${id}`);
}

export function deleteUserById(id: string) {
  return runDbQuery(sql<User[]>`DELETE FROM app_user WHERE id = ${id}`);
}

export function updatePasswordById(id: string, newPassword: string) {
  return runDbQuery(sql<User[]>`UPDATE app_user SET password = ${newPassword} WHERE id = ${id}`);
}
