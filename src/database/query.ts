import postgres, { PendingQuery, Row } from "postgres";
import { errorLogger } from "../services/logger.ts";

interface DbResponse<T> {
  result: Awaited<T> | null;
  error: unknown;
}

interface DbResponseTransaction {
  result: Awaited<postgres.RowList<postgres.Row[]>[]> | null;
  error: unknown;
}

// TODO: Byt till ett bättre namn. Typ getDb
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

export async function hejsanTesting(query: PendingQuery<Row[]>[]): Promise<DbResponseTransaction> {
  try {
    // const vette = query.map((q) => sql`${q}`);

    const hoppsan = "update watch set active = false where active = false returning *";

    const transactionResult = await sql.begin((sql) => [
      sql`update watch set active = false where active = false returning *`,
      sql`update watch set active = false where active = false returning *`,
      // TODO: Det här fungerar inte
      // ...query,
    ]);

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

function getDbUrl() {
  // OBS: lägg märke till import från dotenv. Den kastar inte fel om import saknas men kommer inte att fungera
  if (Deno.env.get("ENV") === "dev") {
    const url = `postgres://${Deno.env.get("PGUSERNAME")}:${Deno.env.get("PGPASSWORD")}@localhost:5432/${Deno.env.get("PGDATABASE")}`;

    return postgres(url);
  }

  const prodDbUrl = Deno.env.get("DATABASE_URL") ?? "";
  return postgres(prodDbUrl);
}
