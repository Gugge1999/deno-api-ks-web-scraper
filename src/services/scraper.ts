// @deno-types="npm:@types/cheerio@^0.22.35"
import { load } from "@cheerio";
import { ScrapedWatch } from "../models/scraped-watches.ts";
import { currentDateAndTime, currentTime } from "./time-and-date.ts";
import { sendErrorNotification, sendWatchNotification } from "./notification.ts";
import { errorLogger, infoLogger } from "./logger.ts";
import { getAllActiveWatches, updateStoredWatches } from "./database.ts";
import { INTERVAL_IN_MS } from "../config/config.ts";

export async function scrapeWatchInfo(watchToScrape: string): Promise<ScrapeWatchInfoRes> {
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
  $(CONTENT_ROW_TITLE_CLASS)
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
    console.log(`No active watches @ ${currentDateAndTime()}`);
  } else {
    const length = storedActiveWatches.length;
    console.log(`Scraping ${length} ${length === 1 ? "watch" : "watches"} @ ${currentDateAndTime()}`);
  }

  for (const watch of storedActiveWatches) {
    const storedWatchRow = watch;

    const storedWatches: ScrapedWatch[] = JSON.parse(storedWatchRow.watches);

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

  setTimeout(compareStoredWithScraped, INTERVAL_IN_MS);
}

async function handleNewScrapedWatch(scrapedWatches: ScrapedWatch[], newScrapedWatches: ScrapedWatch[], storedWatchRowId: string) {
  // TODO: Ska det vara scrapedWatches eller newScrapedWatches?
  updateStoredWatches(scrapedWatches, storedWatchRowId);

  // Loopa över varje ny klocka och skicka mail
  for (const watch of newScrapedWatches) {
    await sendEmailNotification(watch);
  }
}

async function sendEmailNotification(watch: ScrapedWatch) {
  try {
    await sendWatchNotification(getEmailText(watch));

    infoLogger.info({ message: `Email sent with watch: ${watch}` });
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

function getEmailText(newScrapedWatch: ScrapedWatch) {
  return `${newScrapedWatch.name}\n\nLänk: ${newScrapedWatch.link}\n\nDetta mail skickades: ${currentTime()}`;
}

interface ScrapeWatchInfoRes {
  result: ScrapedWatch[] | null;
  error: string | null;
}
