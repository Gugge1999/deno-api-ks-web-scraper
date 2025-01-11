import shift from "postgres-shift";
import { fromFileUrl } from "@std/path/from-file-url";
import { currentDateAndTime } from "../services/time-and-date.ts";
import { sql } from "../database/query.ts";

shift({
  sql,
  path: fromFileUrl(new URL("../../migrations", import.meta.url)),
  before: () => {
    console.log(`Running migrating @${currentDateAndTime()}`);
  },
})
  .then(() => {
    console.log(`Migrations completed successfully @${currentDateAndTime()}`);
    Deno.exit();
  })
  .catch((err: unknown) => {
    console.error("Migrations failed. Error:", err);
    Deno.exit();
  });
