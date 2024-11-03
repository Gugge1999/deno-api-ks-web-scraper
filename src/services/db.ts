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

interface DbResponse<T> {
  result: T | null;
  error: unknown;
}

export async function runDbQuery<T>(query: T): Promise<DbResponse<T>> {
  try {
    const result = await query;

    return { result, error: null };
  } catch (err) {
    errorLogger.error({
      message: "Error i sql",
      stacktrace: err,
    });

    return { result: null, error: err };
  }
}

export function selectAllWatches() {
  return runDbQuery(sql<Watch[]>`select * from watch`);
}

export async function selectAllActiveWatches() {
  return await sql<Watch[]>`select * from watch where active = true`;
}

export function deleteWatchById(id: string) {
  return runDbQuery(sql`delete from watch where id = ${id}`);
}
