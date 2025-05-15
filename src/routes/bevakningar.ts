import { Context, httpErrors, Router, RouterContext } from "@oak/oak";
import { validate } from "jsr:@std/uuid";
import { getAllNotifications } from "../database/notification.ts";
import { deleteWatchById, getAllWatches, saveWatch, toggleActiveStatus } from "../database/watch.ts";
import { Notification } from "../models/notification.ts";
import { ScrapedWatch } from "../models/scraped-watches.ts";
import { WatchDbRes } from "../models/watch-db-res.ts";
import { WatchAndNotificationDto } from "../models/watch-dto.ts";
import { scrapeWatchInfo } from "../services/scraper.ts";

const scraperRoutes = new Router({
  prefix: "/api/bevakningar",
});

scraperRoutes
  .get(`/all-watches`, async (context: Context) => {
    // TODO: Det är nog en bra idé att göra båda selects i samma anrop för att förhindra att två connections behöver skapas.
    // Kanske med https://github.com/porsager/postgres?tab=readme-ov-file#multiple-statements-in-one-query ?

    const [allWatches, notifications] = await Promise.all([getAllWatches(), getAllNotifications()]);

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
  .delete(`/delete-watch/:id`, async (context: RouterContext<string>) => {
    context.assert(validate(context?.params?.id), 422, "id måste vara av typen uuid v4");

    const deleteWatch = await deleteWatchById(context.params.id);

    if (deleteWatch.error) {
      throw new httpErrors.InternalServerError(`Kunde inte radera bevakning dbError: ${deleteWatch.error}`);
    }

    context.response.body = { deleteWatchId: context.params.id };
  })
  .put(`/toggle-active-statuses`, async (context: Context) => {
    await validateBody(context);
    const body = await context.request.body.json();
    const { newActiveStatus, ids }: { newActiveStatus?: boolean; ids?: string[] } = body;

    context.assert(typeof newActiveStatus === "boolean", 422, "newActiveStatus krävs i body och vara av typen bool");
    context.assert(ids, 422, "ids krävs i body");
    context.assert(ids.length !== 0, 422, "Minst ett id krävs i body");
    context.assert(ids.every((id: string) => typeof id === "string"), 422, "Alla ids måste vara av typen string");
    context.assert(ids.some((id: string) => validate(id)), 422, "Ids måste vara av typen uuid v4");

    const watchResult = await toggleActiveStatus(ids, newActiveStatus);

    if (watchResult.error || watchResult.result?.length === 0) {
      throw new httpErrors.InternalServerError(`Kunde inte ändra aktiv status dbError: ${watchResult.error}`);
    }

    context.response.body = {};
  })
  .post(`/save-watch`, async (context: Context) => {
    await validateBody(context);

    const { label, watchToScrape }: { label?: string; watchToScrape?: string } = await context.request.body.json();

    context.assert(label && typeof label === "string", 422, "label krävs i body och vara av typen string");
    context.assert(watchToScrape && typeof watchToScrape === "string", 422, "watchToScrape krävs i body och vara av typen string");
    context.assert(label.length >= 3, 422, "label måste vara minst 3 tecken");
    context.assert(label.length <= 35, 422, "label kan max vara 35 tecken");
    context.assert(watchToScrape.length >= 3, 422, "watchToScrape måste vara minst 3 tecken");
    context.assert(watchToScrape.length <= 35, 422, "watchToScrape kan max vara 35 tecken");

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

    const watches: ScrapedWatch[] = newWatch.result[0].watches;

    const returnDto: WatchAndNotificationDto = {
      id: dbRes.id,
      label: dbRes.label,
      added: dbRes.added,
      active: true,
      lastEmailSent: null,
      notifications: [],
      watchToScrape: dbRes.watch_to_scrape,
      latestWatch: {
        postedDate: watches[0].postedDate,
        link: watches[0].link,
        name: watches[0].name,
      },
    };

    context.response.status = 201;
    context.response.body = returnDto;
  });

function createWatchDto(allWatches: WatchDbRes[], allNotifications: Notification[]): WatchAndNotificationDto[] {
  const returnDto: WatchAndNotificationDto[] = [];

  for (const scrapedWatch of allWatches) {
    const watches: ScrapedWatch[] = scrapedWatch.watches;
    const notificationsForWatch = allNotifications.filter((n) => scrapedWatch.id === n.watch_id).map((m) => m.sent);

    const dto: WatchAndNotificationDto = {
      id: scrapedWatch.id,
      active: scrapedWatch.active,
      added: scrapedWatch.added,
      label: scrapedWatch.label,
      lastEmailSent: scrapedWatch.last_email_sent,
      watchToScrape: scrapedWatch.watch_to_scrape,
      notifications: notificationsForWatch,
      latestWatch: {
        postedDate: watches[0].postedDate,
        link: watches[0].link,
        name: watches[0].name,
      },
    };

    returnDto.push(dto);
  }

  return returnDto;
}

export async function validateBody(context: Context) {
  try {
    await context.request.body.json();
  } catch (e: unknown) {
    // TODO: Den borde heta något annat är dbError, kanske scraperError eller om det ska vara en union?
    throw new httpErrors.UnprocessableEntity(`Body behöver finnas. dbError: ${e}`);
  }
}

export default scraperRoutes;
