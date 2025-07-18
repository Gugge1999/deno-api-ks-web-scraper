import postgres, { PendingQuery, Row } from "postgres";
import { errorLogger, infoLogger } from "../services/logger.ts";

export const sql = await getDb();

interface DbResponse<T> {
  result: Awaited<T> | null;
  error: unknown;
}

interface DbResponseTransaction {
  result: Awaited<postgres.RowList<postgres.Row[]>[]> | null;
  error: unknown;
}

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

export async function hejsanTesting(query: PendingQuery<Row[]>[]): Promise<DbResponseTransaction> {
  try {
    // const vette = query.map((q) => sql`${q}`);

    const hoppsan = "update watch set active = false where active = false returning *";

    const transactionResult = await sql.begin((sql) => {
      const hejsan = "update watch set active = false where active = false returning *";

      return [
        sql`update watch set active = false where active = false returning *`,
      ];
    });

    return {
      result: transactionResult,
      error: null,
    };
  } catch (error) {
    errorLogger.error({ message: "Error i sql (transaktion)", stacktrace: error });

    return {
      result: null,
      error: error,
    };
  }
}

async function getDb() {
  // Behövs för att sql migrations ska fungera
  await import("jsr:@std/dotenv/load");

  const env = Deno.env.get("ENV")?.toLowerCase() ?? "";

  if (env === "") {
    errorLogger.error("ENV is not set in environment variables");
  }

  if (env === "dev") {
    const url = `postgres://${Deno.env.get("PGUSERNAME")}:${Deno.env.get("PGPASSWORD")}@localhost:5432/${Deno.env.get("PGDATABASE")}`;

    return postgres(url);
  }

  const prodDbUrl = Deno.env.get("DATABASE_URL") ?? "";

  if (prodDbUrl === "") {
    errorLogger.error("DATABASE_URL is not set in environment variables");
  }

  return postgres(prodDbUrl, {
    idle_timeout: 20,
    max_lifetime: 60 * 30,
  });
}
