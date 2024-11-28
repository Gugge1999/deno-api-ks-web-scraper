import { httpErrors, Router } from "@oak/oak";
import { deleteWatchById, getAllWatches, saveWatch, toggleActiveStatus } from "../services/database/watch.ts";
import { validate } from "jsr:@std/uuid";
import { WatchDto } from "../models/watch-dto.ts";
import { Watch } from "../models/watch.ts";
import { scrapeWatchInfo } from "../services/scraper.ts";
import { ScrapedWatch } from "../models/scraped-watches.ts";
import { insertNewNotification } from "../services/database/notification.ts";

const scraperRoutes = new Router();

const BEVAKNINGAR_BASE_URL = "/api/bevakningar";

function createWatchDtoObj(watchDbModel: Watch) {
  const watches: ScrapedWatch[] = JSON.parse(watchDbModel.watches);

  const dto: WatchDto = {
    id: watchDbModel.id,
    active: watchDbModel.active,
    added: watchDbModel.added,
    label: watchDbModel.label,
    lastEmailSent: watchDbModel.lastEmailSent,
    watchToScrape: watchDbModel.watchToScrape,
    watch: {
      postedDate: watches[0].postedDate,
      link: watches[0].link,
      name: watches[0].name,
    },
  };

  return dto;
}

scraperRoutes
  .get(`${BEVAKNINGAR_BASE_URL}/all-watches`, async (context) => {
    const allWatches = await getAllWatches();

    if (allWatches.error) {
      throw new httpErrors.InternalServerError("Kunde inte hämta bevakningar");
    }

    const returnDto: WatchDto[] = [];
    if (allWatches.result && allWatches.result.length > 0) {
      for (const scrapedWatch of allWatches.result) {
        const dto = createWatchDtoObj(scrapedWatch);
        returnDto.push(dto);
      }
    }

    context.response.body = returnDto;
  })
  .delete(`${BEVAKNINGAR_BASE_URL}/delete-watch/:id`, async (context) => {
    if (!context?.params?.id || !validate(context?.params?.id)) {
      throw new httpErrors.UnprocessableEntity("Ogiltigt id för bevakning");
    }

    const deleteWatch = await deleteWatchById(context.params.id);

    if (deleteWatch.error) {
      throw new httpErrors.InternalServerError("Kunde inte radera bevakning");
    }

    context.response.body = { deleteWatchId: context.params.id };
  })
  .put(`${BEVAKNINGAR_BASE_URL}/toggle-active-status`, async (context) => {
    /** TODO:
     * WARNING* this is an unreliable API. In HTTP/ 2 in many situations you cannot
     * determine if a request has a body or not unless you attempt to read the body, due
     * to the streaming nature of HTTP/ 2. As of Deno 1.16.1, for HTTP/ 1.1, Deno
     * also reflects that behaviour. The only reliable way to determine if a request has
     * a body or not is to attempt to read the body. */
    if (context.request.hasBody === false) {
      throw new httpErrors.UnprocessableEntity("body krävs");
    }

    const { id, active, label } = await context.request.body.json();

    if (id === undefined || active === undefined || label === undefined) {
      throw new httpErrors.UnprocessableEntity("id, active och label behöver finnas i body");
    }

    const newActiveStatus = !active;

    const watchResult = await toggleActiveStatus(newActiveStatus, id);

    if (watchResult.error) {
      throw new httpErrors.InternalServerError("Kunde inte ändra aktiv status");
    }

    const response = { id, label, active: newActiveStatus };

    context.response.body = response;
  })
  .post(`${BEVAKNINGAR_BASE_URL}/save-watch`, async (context) => {
    /** TODO:
     * WARNING* this is an unreliable API. In HTTP/ 2 in many situations you cannot
     * determine if a request has a body or not unless you attempt to read the body, due
     * to the streaming nature of HTTP/ 2. As of Deno 1.16.1, for HTTP/ 1.1, Deno
     * also reflects that behaviour. The only reliable way to determine if a request has
     * a body or not is to attempt to read the body. */
    if (context.request.hasBody === false) {
      throw new httpErrors.UnprocessableEntity("body krävs");
    }

    const { label, watchToScrape } = await context.request.body.json();

    if (label === undefined || watchToScrape === undefined) {
      throw new httpErrors.UnprocessableEntity("label och watchToScrape behöver finnas i body");
    }

    const scrapedWatches = await scrapeWatchInfo(watchToScrape);

    if (scrapedWatches.error || scrapedWatches.result === null) {
      throw new httpErrors.BadRequest(scrapedWatches.error ?? "");
    }

    const newWatch = await saveWatch(label, watchToScrape, scrapedWatches.result);

    if (newWatch.error || newWatch.result === null) {
      throw new httpErrors.InternalServerError("Kunde inte spara ny bevakning");
    }

    await insertNewNotification(newWatch.result[0].id);

    const dbRes = newWatch.result[0];

    const watches: ScrapedWatch[] = JSON.parse(newWatch.result[0].watches.toString());

    const returnDto: WatchDto = {
      id: dbRes.id,
      active: true,
      label: dbRes.label,
      lastEmailSent: null,
      added: dbRes.added,
      watchToScrape: dbRes.watchToScrape,
      watch: {
        postedDate: watches[0].postedDate,
        link: watches[0].link,
        name: watches[0].name,
      },
    };

    context.response.body = returnDto;
  });

export default scraperRoutes;
