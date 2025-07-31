// @deno-types="npm:@types/cheerio@^0.22.35"
import { load } from "cheerio";
import { ScrapedWatch } from "../models/scraped-watches.ts";
import { currentDateAndTime, currentTime } from "./time-and-date.ts";
import { sendEmailNotification, sendErrorEmailNotification } from "./email-notification.ts";
import { errorLogger, infoLogger } from "./logger.ts";
import { getAllActiveWatches, updateStoredWatches } from "../database/watch.ts";
import { INTERVAL_IN_MS } from "../constants/config.ts";
import { setTimeout as setTimeoutPromise } from "node:timers/promises";
import { retry, RetryError, type RetryOptions } from "jsr:@std/async";

const retryOptions: RetryOptions = {
  maxAttempts: 3,
  minTimeout: 250,
  multiplier: 2,
  jitter: 0,
};

export async function scrapeWatchInfo(watchToScrape: string): Promise<ScrapeWatchInfoRes> {
  let response: Response;

  try {
    response = await retry(() => fetch(watchToScrape), retryOptions);
  } catch (err) {
    if (err instanceof RetryError) {
      errorLogger.error({ Msg: `Retry error : + ${err.message}` });
      errorLogger.error({ Cause: `Error cause : + ${err.cause}` });
    }

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

  const contentRowTitleClass = ".contentRow-title";

  // Länken gav inga resultat.
  if ($(contentRowTitleClass).length === 0) {
    return {
      result: null,
      error: "Sökning gav 0 resultat. Försök igen med ny sökterm",
    };
  }

  const titles: string[] = [];
  const dates: string[] = [];
  const links: string[] = [];

  // Titel
  $(contentRowTitleClass)
    .get()
    .map((element: unknown) => {
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
    .map((element: unknown) => {
      const date = Number.parseInt($(element).attr("data-time") ?? "");

      const isoDate = new Date(date * 1000).toISOString();

      if (isoDate) {
        dates.push(isoDate);
      }
    });

  // Länk
  $(contentRowTitleClass)
    .get()
    .map((element: unknown) => links.push(`https://klocksnack.se${$(element).find("a").attr("href")}`));

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

let lockScraping = false;

export async function compareStoredWithScraped(): Promise<boolean> {
  try {
    if (lockScraping) {
      return false;
    }

    const activeWatchesDbRes = await getAllActiveWatches();

    if (activeWatchesDbRes.error || activeWatchesDbRes.result === null) {
      return false;
    }

    // const iuqhwdiuqhw = sql`update watch set active = false where active = false returning *`;
    //
    // const hejsan = await hejsanTesting([iuqhwdiuqhw]);
    //
    // console.log("hejsan ", hejsan.result?.[0]);

    const activeWatchesLength = activeWatchesDbRes.result.length;

    activeWatchesLength === 0 ? console.log(`No active watches @ %c${currentDateAndTime()}`, "color: deepskyblue") : console.log(
      `Scraping ${activeWatchesLength} ${activeWatchesLength === 1 ? "watch" : "watches"} @ %c${currentDateAndTime()}`,
      "color: deepskyblue",
    );

    for (const storedWatch of activeWatchesDbRes.result) {
      const storedWatches: ScrapedWatch[] = storedWatch.watches;

      await setTimeoutPromise(250);
      const scrapedWatches = await scrapeWatchInfo(storedWatch.watch_to_scrape);

      if (scrapedWatches.error || scrapedWatches.result === null) {
        return false;
      }

      const intersectingNewScrapedWatches = scrapedWatches.result.filter(({ postedDate: a }) =>
        !storedWatches.some(({ postedDate: b }) => b === a)
      );

      if (intersectingNewScrapedWatches.length > 0) {
        const updateWatchRes = await updateStoredWatches(scrapedWatches.result, storedWatch.id);

        if (updateWatchRes.error || updateWatchRes.result === null) {
          return false;
        }

        await handleNewScrapedWatch(intersectingNewScrapedWatches);
      }
    }

    return true;
  } catch (err) {
    errorLogger.error({
      message: "compareStoredWithScraped failed.",
      stacktrace: err,
    });

    return false;
  }
}

setInterval(compareStoredWithScraped, INTERVAL_IN_MS);

async function handleNewScrapedWatch(newScrapedWatches: ScrapedWatch[]) {
  // Lås scraping av nya bevakningar medans notiser skickas
  lockScraping = true;

  for (const watch of newScrapedWatches) {
    await sendNotification(watch);
  }

  lockScraping = false;
}

async function sendNotification(watch: ScrapedWatch): Promise<boolean> {
  try {
    await sendEmailNotification(getEmailText(watch));

    infoLogger.info({ message: `Email sent. Name: ${(watch.name)}, link: ${watch.link}` });

    await setTimeoutPromise(5_000);
    lockScraping = false;
    return true;
  } catch (err) {
    errorLogger.error({
      message: "Function sendWatchNotification failed.",
      stacktrace: err,
    });

    await sendErrorEmailNotification(err);

    lockScraping = false;

    return false;
  }
}

function getEmailText(watch: ScrapedWatch) {
  return `${watch.name}\n\n` +
    `Länk: ${watch.link}\n\n` +
    `Detta mail skickades: ${currentTime()}`;
}

interface ScrapeWatchInfoRes {
  result: ScrapedWatch[] | null;
  error: string | null;
}
