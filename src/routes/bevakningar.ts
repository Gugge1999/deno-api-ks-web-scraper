import { httpErrors, Router } from "@oak/oak";
import { deleteWatchById, getAllWatches, saveWatch, toggleActiveStatus } from "../database/watch.ts";
import { validate } from "jsr:@std/uuid";
import { WatchDto } from "../models/watch-dto.ts";
import { Watch } from "../models/watch.ts";
import { scrapeWatchInfo } from "../services/scraper.ts";
import { ScrapedWatch } from "../models/scraped-watches.ts";

const scraperRoutes = new Router();

const BEVAKNINGAR_BASE_URL = "/api/bevakningar";

scraperRoutes
  .get(`${BEVAKNINGAR_BASE_URL}/all-watches`, async (context) => {
    const allWatches = await getAllWatches();

    if (allWatches.error) {
      throw new httpErrors.InternalServerError("Kunde inte hämta bevakningar");
    }

    let returnDto: WatchDto[] = [];
    if (allWatches.result && allWatches.result.length > 0) {
      returnDto = createWatchDto(allWatches.result);
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
    try {
      await context.request.body.json();
    } catch (e) {
      throw new httpErrors.UnprocessableEntity(`Body krävs. Error: ${e}`);
    }

    const { id, active, label }: { id?: string; label?: string; active?: boolean } = await context.request.body.json();

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
    try {
      await context.request.body.json();
    } catch (e) {
      throw new httpErrors.UnprocessableEntity(`Body krävs. Error: ${e}`);
    }

    const { label, watchToScrape }: { label?: string; watchToScrape?: string } = await context.request.body.json();

    if (label === undefined || watchToScrape === undefined) {
      throw new httpErrors.UnprocessableEntity("label och watchToScrape behöver finnas i body");
    }

    const scrapedWatches = await scrapeWatchInfo(watchToScrape);

    if (scrapedWatches.error !== null || scrapedWatches.result === null) {
      throw new httpErrors.BadRequest(scrapedWatches.error ?? "");
    }

    const newWatch = await saveWatch(label, watchToScrape, scrapedWatches.result);

    if (newWatch.error || newWatch.result === null) {
      throw new httpErrors.InternalServerError("Kunde inte spara ny bevakning");
    }

    const dbRes = newWatch.result[0];

    const watches: ScrapedWatch[] = JSON.parse(newWatch.result[0].watches);

    const returnDto: WatchDto = {
      id: dbRes.id,
      label: dbRes.label,
      added: dbRes.added,
      active: true,
      lastEmailSent: null,
      watchToScrape: dbRes.watchToScrape,
      watch: {
        postedDate: watches[0].postedDate,
        link: watches[0].link,
        name: watches[0].name,
      },
    };

    context.response.body = returnDto;
  });

function createWatchDto(allWatches: Watch[]) {
  const returnDto: WatchDto[] = [];

  for (const scrapedWatch of allWatches) {
    const watches: ScrapedWatch[] = JSON.parse(scrapedWatch.watches);

    const dto: WatchDto = {
      ...scrapedWatch,
      watch: {
        postedDate: watches[0].postedDate,
        link: watches[0].link,
        name: watches[0].name,
      },
    };

    returnDto.push(dto);
  }

  return returnDto;
}

export default scraperRoutes;
