import postgres from "@postgres";
import "jsr:@std/dotenv/load";
import { Watch } from "../models/watch.ts";
import { errorLogger } from "./logger.ts";
import { httpErrors } from "@oak/oak";
import { ScrapedWatch } from "../models/scraped-watches.ts";

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
  result: Awaited<T> | null;
  error: unknown;
}

async function runDbQuery<T>(query: T): Promise<DbResponse<T>> {
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

export function getAllWatches() {
  return runDbQuery(sql<Watch[]>`SELECT * FROM watch ORDER BY added`);
}

export function getAllActiveWatches() {
  return runDbQuery(sql<Watch[]>`SELECT * FROM watch WHERE active = true ORDER BY added`);
}

export function deleteWatchById(id: string) {
  return runDbQuery(sql`DELETE FROM watch WHERE id = ${id}`);
}

export async function toggleActiveStatus(isActive: boolean, id: string) {
  const watch = await getWatchById(id);

  if (watch.error || (watch.result && watch.result.length === 0)) {
    throw new httpErrors.InternalServerError(`Kunde inte hitta bevakning med id: ${id}`);
  }

  return runDbQuery(sql`UPDATE watch SET active = ${isActive} WHERE id = ${id}`);
}

export function saveWatch(label: string, watchToScrape: string, scrapedWatches: ScrapedWatch[]) {
  // TODO: Kom ihåg att lägga till clock_timestamp() i postgres migration

  const newWatchQuery = sql<Watch[]>`
    INSERT INTO watch(label, "watchToScrape", active,  watches)
    VALUES
    (${label}, ${watchToScrape}, ${true}, ${JSON.stringify(scrapedWatches)})
    RETURNING *`;

  return runDbQuery(newWatchQuery);
}

export function updateStoredWatches(scrapedWatches: ScrapedWatch[], storedWatchRowId: string) {}

function getWatchById(id: string) {
  return runDbQuery(sql<Watch[]>`SELECT FROM watch WHERE id = ${id}`);
}
