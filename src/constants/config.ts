export const INTERVAL_IN_MIN = 60;
/** Varje minut och varje 60:e minut. */
export const SCRAPING_INTERVAL_IN_MS = INTERVAL_IN_MIN * (Deno.env.get("ENV") === "dev" ? 1_000 : 60_000);
