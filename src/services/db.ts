import postgres from "npm:postgres@3.4.5";
import "jsr:@std/dotenv/load";
import { Watch } from "../models/watch.ts";
import { errorLogger } from "./logger.ts";
import { httpErrors } from "@oak/oak";

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

// TODO: Det går nog att skapa en wrapper för att köra all sql. Då slipper man upprepade try catch
export async function selectAllWatches() {
  try {
    return await sql<Watch[]>`select * from watchasd`;
  } catch (err) {
    handleError(err);

    throw new httpErrors.InternalServerError("asdasdasd oiqj3981u2d");
  }
}

export async function selectAllActiveWatches() {
  return await sql<Watch[]>`select * from watch where active = true`;
}

export async function deleteWatchById(id: string) {
  try {
    return await sql`delete from watch where id = ${id}`;
  } catch (err) {
    handleError(err);
    return null;
  }
}

function handleError(err: unknown) {
  errorLogger.error({
    message: "Function AppDataSource.initialize failed",
    stacktrace: err,
  });
}
