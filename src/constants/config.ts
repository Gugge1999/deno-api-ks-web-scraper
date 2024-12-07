import "jsr:@std/dotenv/load";

export const INTERVAL_IN_MIN = 10;
export const INTERVAL_IN_MS = INTERVAL_IN_MIN * (Deno.env.get("ENV") === "dev" ? 3_000 : 60_000);
