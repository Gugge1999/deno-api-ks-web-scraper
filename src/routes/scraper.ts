import { httpErrors, Router } from "@oak/oak";
import { deleteWatchById, selectAllWatches } from "../services/db.ts";
import { validate } from "jsr:@std/uuid";

const scraperRoutes = new Router();

scraperRoutes
  .get("/all-watches", async (context) => {
    const allWatches = await selectAllWatches();

    if (allWatches.error) {
      throw new httpErrors.InternalServerError("Kunde inte hämta bevakningar");
    }

    context.response.body = allWatches.result;
  })
  .delete("/delete-watch/:id", async (context) => {
    if (!context?.params?.id || !validate(context?.params?.id)) {
      throw new httpErrors.UnprocessableEntity("Ogiltigt id för bevakning");
    }

    const deleteWatch = await deleteWatchById(context.params.id);

    if (deleteWatch.error) {
      throw new httpErrors.InternalServerError("Kunde inte radera bevakning");
    }

    context.response.body = { deleteWatchId: context.params.id };
  });

export default scraperRoutes;
