import postgres from "npm:postgres@3.4.5";
import "jsr:@std/dotenv/load";
import { Watch } from "../models/watch.ts";
import { errorLogger } from "./logger.ts";

// TODO: För url kanske det går att använda
// const sql = postgres('postgres://username:password@host:port/database');

// OBS: lägg märke till import från dotenv
const sql = postgres({
  host: Deno.env.get("PGHOST"),
  port: Number.parseInt(Deno.env.get("PGPORT") ?? "0"),
  username: Deno.env.get("PGUSERNAME"),
  password: Deno.env.get("PGPASSWORD"),
  database: Deno.env.get("PGDATABASE"),
});

export async function runDbQuery<T>(query: T): Promise<T | null> {
  try {
    return await query;
  } catch (err) {
    handleError(err);

    // TODO: Ska den vara kvar?
    // throw new httpErrors.InternalServerError("Hejsan");

    return null;
  }
}

export function selectAllWatches() {
  const query = sql<Watch[]>`select * from watch`;
  return runDbQuery<postgres.PendingQuery<Watch[]>>(query);
}

export async function selectAllActiveWatches() {
  return await sql<Watch[]>`select * from watch where active = true`;
}

export function deleteWatchById(id: string) {
  const query = sql`delete from watch where id = ${id}`;
  return runDbQuery<postgres.PendingQuery<postgres.Row[]>>(query);
}

function handleError(err: unknown) {
  errorLogger.error({
    // TODO: fixa narrowing från err
    message: "error i sql",
    stacktrace: err,
  });
}
