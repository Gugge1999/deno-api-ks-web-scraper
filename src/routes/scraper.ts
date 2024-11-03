import { httpErrors, Router } from "@oak/oak";
import { deleteWatchById, runDbQuery, selectAllWatches } from "../services/db.ts";
import { validate } from "jsr:@std/uuid";

const scraperRoutes = new Router();

scraperRoutes
  .get("/all-watches", async (context) => {
    context.response.body = await selectAllWatches();
  })
  .delete("/delete-watch/:id", async (context) => {
    if (!context?.params?.id || !validate(context?.params?.id)) {
      throw new httpErrors.UnprocessableEntity("Ogiltigt id för bevakning");
    }

    await deleteWatchById(context.params.id);

    context.response.body = { deleteWatchId: context.params.id };
  });

export default scraperRoutes;
