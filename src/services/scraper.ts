// @deno-types="npm:@types/cheerio@^0.22.35"
import { load } from "cheerio";
import { ScrapedWatch } from "../models/scraped-watches.ts";
import { currentDateAndTime, currentTime } from "./time-and-date.ts";
import { sendEmailNotification, sendErrorEmailNotification } from "./email-notification.ts";
import { errorLogger, infoLogger } from "./logger.ts";
import { getAllActiveWatches, updateStoredWatches } from "../database/watch.ts";
import { INTERVAL_IN_MS } from "../constants/config.ts";

export async function scrapeWatchInfo(watchToScrape: string): Promise<ScrapeWatchInfoRes> {
  let response: Response;

  try {
    response = await fetch(watchToScrape);
  } catch (err) {
    const message = `Kunde inte hämta url. Angiven url: ${watchToScrape}`;

    errorLogger.error({ message });

    console.error(message, err);
    return {
      result: null,
      error: message,
    };
  }

  const body = await response.text();

  const $ = load(body);

  const CONTENT_ROW_TITLE_CLASS = ".contentRow-title";

  // Länken gav inga resultat.
  if ($(CONTENT_ROW_TITLE_CLASS).length === 0) {
    return {
      result: null,
      error: "Klocka gav 0 resultat. Försök igen med ny klocka",
    };
  }

  const titles: string[] = [];
  const dates: string[] = [];
  const links: string[] = [];

  // Titel
  $(CONTENT_ROW_TITLE_CLASS)
    .get()
    .map((element: any) => {
      // TODO: Det här gåt nog att göra enklare och bara plocka ut texten för namnet på annonsen. Inte badge för status också
      return titles.push(
        $(element)
          .text()
          .replace(
            // TODO: Den här verkar ta med &nbsp också
            /Tillbakadragen|Avslutad|Säljes|\/Bytes|Köpes|Hittat|Företagsannons|OHPF|\//gi,
            "",
          )
          .trim(),
      );
    });

  // Datum
  $(".u-dt")
    .get()
    .map((element: any) => {
      const date = $(element).attr("datetime");
      if (date) {
        dates.push(date);
      }
    });

  // Länk
  // TODO: Ska element vara av typen Element?
  $(CONTENT_ROW_TITLE_CLASS)
    .get()
    .map((element: any) => links.push(`https://klocksnack.se${$(element).find("a").attr("href")}`));

  const scrapedWatches: ScrapedWatch[] = [];

  titles.forEach((_, index) => {
    const currentWatchInfo: ScrapedWatch = {
      name: titles[index],
      postedDate: dates[index],
      link: links[index],
    };
    scrapedWatches.push(currentWatchInfo);
  });

  return {
    result: scrapedWatches,
    error: null,
  };
}

export async function compareStoredWithScraped() {
  const getAllWatchesDbRes = await getAllActiveWatches();

  if (getAllWatchesDbRes.error || getAllWatchesDbRes.result === null) {
    return;
  }

  const activeWatchesLength = getAllWatchesDbRes.result.length;

  activeWatchesLength === 0 ? console.log(`No active watches @ %c${currentDateAndTime()}`, "color: deepskyblue") : console.log(
    `Scraping ${activeWatchesLength} ${activeWatchesLength === 1 ? "watch" : "watches"} @ %c${currentDateAndTime()}`,
    "color: deepskyblue",
  );

  const storedActiveWatches = getAllWatchesDbRes.result;
  for (const watch of storedActiveWatches) {
    const storedWatch = watch;

    const storedWatches: ScrapedWatch[] = JSON.parse(storedWatch.watches);

    const scrapedWatches = await scrapeWatchInfo(storedWatch.watch_to_scrape);

    if (scrapedWatches.error || scrapedWatches.result === null) {
      return;
    }

    // Vänta 1 sekund mellan varje anrop till KS
    await new Promise((resolve) => setTimeout(resolve, 1_000));

    const intersectingNewScrapedWatches = scrapedWatches.result.filter(({ postedDate: a }) =>
      !storedWatches.some(({ postedDate: b }) => b === a)
    );

    if (intersectingNewScrapedWatches.length > 0) {
      const updateWatchRes = await updateStoredWatches(scrapedWatches.result, storedWatch.id);

      if (updateWatchRes.error || updateWatchRes.result === null) {
        return;
      }

      await handleNewScrapedWatch(intersectingNewScrapedWatches);
    }
  }
}

setInterval(compareStoredWithScraped, INTERVAL_IN_MS);

async function handleNewScrapedWatch(newScrapedWatches: ScrapedWatch[]) {
  for (const watch of newScrapedWatches) {
    await sendNotification(watch);
  }
}

async function sendNotification(watch: ScrapedWatch) {
  try {
    await sendEmailNotification(emailText(watch));

    infoLogger.info({ message: `Email sent with watch: ${JSON.stringify(watch)}` });

    const notificationDelay = Deno.env.get("ENV") === "dev" ? 1 : 5_000;

    await new Promise((resolve) => setTimeout(resolve, notificationDelay));
  } catch (err) {
    errorLogger.error({
      message: "Function sendWatchNotification failed.",
      stacktrace: err,
    });

    await sendErrorEmailNotification(err);
  }
}

const emailText = (watch: ScrapedWatch) => `${watch.name}\n\nLänk: ${watch.link}\n\nDetta mail skickades: ${currentTime()}`;

interface ScrapeWatchInfoRes {
  result: ScrapedWatch[] | null;
  error: string | null;
}
