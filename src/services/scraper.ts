// @deno-types="npm:@types/cheerio@^0.22.35"
import { load } from "@cheerio";
import { ScrapedWatch } from "../models/scraped-watches.ts";
import { ApiErrorDto } from "../models/api-error.dto.ts";
import { dateAndTime, time } from "./time-and-date.ts";
import { sendErrorNotification, sendWatchNotification } from "./notification.ts";
import { errorLogger, infoLogger } from "./logger.ts";
import { getAllActiveWatches, updateStoredWatches } from "./db.ts";
import { intervalInMs } from "../config/config.ts";

export async function scrapeWatchInfo(watchToScrape: string): Promise<{ result: ScrapedWatch[] | null; error: string | null }> {
  let response: Response;

  try {
    response = await fetch(watchToScrape);
  } catch (err) {
    const message = `Kunde inte hämta url url ${watchToScrape}`;

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
      error: "Watch name yielded no results",
    };
  }

  const titles: string[] = [];
  const dates: string[] = [];
  const links: string[] = [];

  // Titel
  $(contentRowTitleClass)
    .get()
    .map((element: any) => {
      return titles.push(
        $(element)
          .text()
          .replace(
            // Radera säljstatus
            /Tillbakadragen|Avslutad|Säljes\/Bytes|Säljes|Bytes|OHPF|\//i,
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
  $(contentRowTitleClass)
    .get()
    .map((element: any) => links.push(`https://klocksnack.se${$(element).find("a").attr("href")}`));

  const scrapedWatches: ScrapedWatch[] = [];

  // TODO: Behöver det vara index?
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

  const storedActiveWatches = getAllWatchesDbRes.result;

  if (storedActiveWatches.length === 0) {
    console.log(`No active watches @ ${dateAndTime()}`);
  } else {
    const length = storedActiveWatches.length;
    console.log(`Scraping ${length} ${length === 1 ? "watch" : "watches"} @ ${dateAndTime()}`);
  }

  for (const watch of storedActiveWatches) {
    const storedWatchRow = watch;

    const storedWatches = storedWatchRow.watches;

    const scrapedWatches = await scrapeWatchInfo(storedWatchRow.watchToScrape);

    if (scrapedWatches.error || scrapedWatches.result === null) {
      return;
    }

    // Vänta 1 sekund mellan varje anrop till KS
    await new Promise((resolve) => setTimeout(resolve, 1_000));

    // TODO: Just nu jämförs de lagrade klockorna och de scrape:ade endast på postedDate. Är det unikt nog ?
    const newScrapedWatches = scrapedWatches.result.filter(({ postedDate: a }: { postedDate: string }) => {
      return !storedWatches.some(({ postedDate: b }: { postedDate: string }) => b === a);
    });

    if (newScrapedWatches.length > 0) {
      await handleNewScrapedWatch(scrapedWatches.result, newScrapedWatches, storedWatchRow.id);
    }
  }

  setTimeout(compareStoredWithScraped, intervalInMs);
}

async function handleNewScrapedWatch(scrapedWatches: ScrapedWatch[], newScrapedWatches: ScrapedWatch[], storedWatchRowId: string) {
  // TODO: Ska det vara scrapedWatches eller newScrapedWatches?
  updateStoredWatches(scrapedWatches, storedWatchRowId);

  // Loopa över varje ny klocka och skicka mail
  for (const watch of newScrapedWatches) {
    // TODO: Ska inte try catch täcka hela compareStoredWithScraped?
    try {
      // TODO: Bryt ut till en egen funktion för att undvika djup nestling
      await sendWatchNotification(getEmailText(watch));

      infoLogger.info({ message: "Email sent." });
      // Skriv till databas (skapa tabell) om när ett mail skickades.

      // Vänta 5 sekunder mellan varje mail.
      await new Promise((resolve) => setTimeout(resolve, 5_000));
    } catch (err) {
      await sendErrorNotification(err);
      errorLogger.error({
        message: "Function sendWatchNotification failed.",
        stacktrace: err,
      });
    }
  }
}

function getEmailText(newScrapedWatch: ScrapedWatch) {
  return `${newScrapedWatch.name}\n\nLänk: ${newScrapedWatch.link}\n\nDetta mail skickades: ${time()}`;
}
