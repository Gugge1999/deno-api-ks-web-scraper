import { errorLogger } from "../services/logger.ts";
import postgres from "postgres";
import "jsr:@std/dotenv/load";

interface DbResponse<T> {
  result: Awaited<T> | null;
  error: unknown;
}

// TODO: För url kanske det går att använda
// const sql = postgres('postgres://username:password@host:port/database');

// OBS: lägg märke till import från dotenv
export const sql = postgres({
  host: Deno.env.get("PGHOST"),
  port: Number.parseInt(Deno.env.get("PGPORT") ?? "0"),
  username: Deno.env.get("PGUSERNAME"),
  password: Deno.env.get("PGPASSWORD"),
  database: Deno.env.get("PGDATABASE"),
});

export async function runDbQuery<T>(query: T): Promise<DbResponse<T>> {
  try {
    const result = await query;

    return {
      result,
      error: null,
    };
  } catch (error) {
    errorLogger.error({
      message: "Error i sql",
      stacktrace: error,
    });

    return {
      result: null,
      error,
    };
  }
}
