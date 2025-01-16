import { httpErrors, Router } from "@oak/oak";
import { deleteWatchById, getAllWatches, saveWatch, toggleActiveStatus, toggleAllStatuses } from "../database/watch.ts";
import { validate } from "jsr:@std/uuid";
import { WatchAndNotificationDto } from "../models/watch-dto.ts";
import { WatchDbRes } from "../models/watch-db-res.ts";
import { scrapeWatchInfo } from "../services/scraper.ts";
import { ScrapedWatch } from "../models/scraped-watches.ts";
import { getAllNotifications } from "../database/notification.ts";
import { Notification } from "../models/notification.ts";

const scraperRoutes = new Router({
  prefix: "/api/bevakningar",
});

scraperRoutes
  .get(`/all-watches`, async (context) => {
    const [allWatches, notifications] = await Promise.all([await getAllWatches(), await getAllNotifications()]);

    if (allWatches.error || notifications.error || notifications.result === null) {
      throw new httpErrors.InternalServerError(
        `Kunde inte hämta bevakningar och notiser. dbError - allWatches.error: ${allWatches.error} "- notification error: ${notifications.error}`,
      );
    }

    let returnDto: WatchAndNotificationDto[] = [];
    if (allWatches.result && allWatches.result.length > 0) {
      returnDto = createWatchDto(allWatches.result, notifications.result);
    }

    context.response.body = returnDto;
  })
  .delete(`/delete-watch/:id`, async (context) => {
    if (!context?.params?.id || !validate(context?.params?.id)) {
      throw new httpErrors.UnprocessableEntity("Ogiltigt id för bevakning");
    }

    const deleteWatch = await deleteWatchById(context.params.id);

    if (deleteWatch.error) {
      throw new httpErrors.InternalServerError(`Kunde inte radera bevakning dbError: ${deleteWatch.error}`);
    }

    context.response.body = { deleteWatchId: context.params.id };
  })
  .put(`/toggle-active-status`, async (context) => {
    await validateBody(context);

    const { id, active, label }: { id?: string; label?: string; active?: boolean } = await context.request.body.json();

    if (id === undefined || active === undefined || label === undefined) {
      throw new httpErrors.UnprocessableEntity("id, active och label behöver finnas i body");
    }

    const newActiveStatus = !active;

    const watchResult = await toggleActiveStatus(newActiveStatus, id);

    if (watchResult.error || watchResult.result?.length === 0) {
      throw new httpErrors.InternalServerError(`Kunde inte ändra aktiv status dbError: ${watchResult.error}`);
    }

    const response = { active: newActiveStatus, ...watchResult };

    context.response.body = response;
  })
  .post(`/save-watch`, async (context) => {
    await validateBody(context);

    const { label, watchToScrape }: { label?: string; watchToScrape?: string } = await context.request.body.json();

    if (label === undefined || watchToScrape === undefined) {
      throw new httpErrors.UnprocessableEntity("label och watchToScrape behöver finnas i body");
    }
    const watchToScrapeLink =
      `https://klocksnack.se/search/1/?q=${watchToScrape}&t=post&c[child_nodes]=1&c[nodes][0]=11&c[title_only]=1&o=date` as const;

    const scrapedWatches = await scrapeWatchInfo(watchToScrapeLink);

    if (scrapedWatches.error !== null || scrapedWatches.result === null) {
      throw new httpErrors.BadRequest(scrapedWatches.error ?? ` dbError: ${scrapedWatches.error}`);
    }

    const newWatch = await saveWatch(label, watchToScrapeLink, scrapedWatches.result);

    if (newWatch.error || newWatch.result === null) {
      throw new httpErrors.InternalServerError(`Kunde inte spara ny bevakning dbError: ${newWatch.error}`);
    }

    const dbRes = newWatch.result[0];

    const watches: ScrapedWatch[] = JSON.parse(newWatch.result[0].watches);

    const returnDto: WatchAndNotificationDto = {
      id: dbRes.id,
      label: dbRes.label,
      added: dbRes.added,
      active: true,
      lastEmailSent: null,
      notifications: [],
      watchToScrape: dbRes.watch_to_scrape,
      watch: {
        postedDate: watches[0].postedDate,
        link: watches[0].link,
        name: watches[0].name,
      },
    };

    context.response.body = returnDto;
  })
  .patch(`/toggle-all`, async (context) => {
    await validateBody(context);

    const { ids, activateAll }: { ids?: string[]; activateAll?: boolean } = await context.request.body.json();

    if (ids === undefined || activateAll === undefined) {
      throw new httpErrors.UnprocessableEntity("ids och isToggleActive behöver finnas i body");
    }

    const toggleAllResult = await toggleAllStatuses(ids, activateAll);

    if (toggleAllResult.error || toggleAllResult.result?.length === 0) {
      throw new httpErrors.InternalServerError(`Kunde inte ändra aktiv status på alla bevakningar: ${toggleAllResult.error}`);
    }

    const response = {};

    context.response.body = response;
  });

function createWatchDto(allWatches: WatchDbRes[], allNotifications: Notification[]): WatchAndNotificationDto[] {
  const returnDto: WatchAndNotificationDto[] = [];

  for (const scrapedWatch of allWatches) {
    const watches: ScrapedWatch[] = JSON.parse(scrapedWatch.watches);
    const notificationsForWatch = allNotifications.filter((n) => scrapedWatch.id === n.watch_id).map((m) => m.sent);

    const dto: WatchAndNotificationDto = {
      id: scrapedWatch.id,
      active: scrapedWatch.active,
      added: scrapedWatch.added,
      label: scrapedWatch.label,
      lastEmailSent: scrapedWatch.last_email_sent,
      watchToScrape: scrapedWatch.watch_to_scrape,
      notifications: notificationsForWatch,
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

// TODO: Går den att typa bättre?
export async function validateBody(context: any) {
  try {
    await context.request.body.json();
  } catch (e: unknown) {
    // TODO: Den borde heta något annat är dbError, kanske scraperError eller om det ska vara en union?
    throw new httpErrors.UnprocessableEntity(`Body behöver finnas. dbError: ${e}`);
  }
}

export default scraperRoutes;
