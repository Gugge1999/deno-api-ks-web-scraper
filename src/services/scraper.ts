// @deno-types="npm:@types/cheerio@^0.22.35"
import { load } from "cheerio";
import { ScrapedWatch } from "../models/scraped-watches.ts";
import { currentDateAndTime, currentTime } from "./time-and-date.ts";
import { sendEmailNotification, sendErrorEmailNotification } from "./email-notification.ts";
import { errorLogger, infoLogger } from "./logger.ts";
import { getAllActiveWatches, updateStoredWatches } from "../database/watch.ts";
import { INTERVAL_IN_MS } from "../constants/config.ts";
import { setTimeout as setTimeoutPromise } from "node:timers/promises";

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

// TODO: Om den här misslyckas kommer inte appen att starta igen. Tror jag
export async function compareStoredWithScraped(): Promise<boolean> {
  try {
    const getAllWatchesDbRes = await getAllActiveWatches();

    if (getAllWatchesDbRes.error || getAllWatchesDbRes.result === null) {
      return false;
    }

    // const iuqhwdiuqhw = sql`update watch set active = false where active = false returning *`;
    //
    // const hejsan = await hejsanTesting([iuqhwdiuqhw]);
    //
    // console.log("hejsan ", hejsan.result?.[0]);

    const activeWatchesLength = getAllWatchesDbRes.result.length;

    activeWatchesLength === 0 ? console.log(`No active watches @ %c${currentDateAndTime()}`, "color: deepskyblue") : console.log(
      `Scraping ${activeWatchesLength} ${activeWatchesLength === 1 ? "watch" : "watches"} @ %c${currentDateAndTime()}`,
      "color: deepskyblue",
    );

    const storedActiveWatches = getAllWatchesDbRes.result;
    for (const watch of storedActiveWatches) {
      const storedWatch = watch;

      const storedWatches: ScrapedWatch[] = storedWatch.watches;

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
  // Vänta 1 sekund mellan varje mail
  await setTimeoutPromise(1_000);

  for (const watch of newScrapedWatches) {
    await sendNotification(watch);
  }
}

async function sendNotification(watch: ScrapedWatch) {
  try {
    await sendEmailNotification(getEmailText(watch));

    infoLogger.info({ message: `Email sent with watch name: ${(watch.name)}, link: ${watch.link}` });

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

function getEmailText(watch: ScrapedWatch) {
  return `
${watch.name}

Länk: ${watch.link}

Detta mail skickades: ${currentTime()}`;
}

interface ScrapeWatchInfoRes {
  result: ScrapedWatch[] | null;
  error: string | null;
}
