import { errorLogger } from "../services/logger.ts";
import "jsr:@std/dotenv/load";
import postgres from "postgres";

interface DbResponse<T> {
  result: Awaited<T> | null;
  error: unknown;
}

// OBS: lägg märke till import från dotenv. Den kastar inte fel om import saknas men kommer inte att fungera
export const sql = Deno.env.get("ENV") === "dev"
  ? postgres({
    host: Deno.env.get("PGHOST"),
    port: Number.parseInt(Deno.env.get("PGPORT") ?? "0"),
    username: Deno.env.get("PGUSERNAME"),
    password: Deno.env.get("PGPASSWORD"),
    database: Deno.env.get("PGDATABASE"),
  })
  : postgres(Deno.env.get("DATABASE_URL") ?? "", { // TODO: Testa den i fly.io sen
    ssl: true,
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
