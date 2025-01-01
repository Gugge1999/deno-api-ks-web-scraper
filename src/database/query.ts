import { errorLogger } from "../services/logger.ts";
import "jsr:@std/dotenv/load";
import postgres, { PostgresError } from "postgres";

interface DbResponse<T> {
  result: Awaited<T> | null;
  error: PostgresError | unknown;
}

export const sql = getDbUrl();

export async function runDbQuery<T>(query: T): Promise<DbResponse<T>> {
  try {
    const result = await query;

    return {
      result: result,
      error: null,
    };
  } catch (error) {
    errorLogger.error({ message: "Error i sql", stacktrace: error });

    return {
      result: null,
      error: error,
    };
  }
}

function getDbUrl() {
  // OBS: lägg märke till import från dotenv. Den kastar inte fel om import saknas men kommer inte att fungera
  if (Deno.env.get("ENV") === "dev") {
    const url = `postgres://${Deno.env.get("PGUSERNAME")}:${Deno.env.get("PGPASSWORD")}@localhost:5432/${Deno.env.get("PGDATABASE")}`;

    return postgres(url);
  }

  const prodDbUrl = Deno.env.get("DATABASE_URL") ?? "";
  return postgres(prodDbUrl);
}
