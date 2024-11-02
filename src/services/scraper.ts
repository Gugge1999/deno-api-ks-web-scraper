// @deno-types="npm:@types/cheerio@^0.22.35"
import { load } from "npm:cheerio@1.0.0";
import { ScrapedWatch } from "../models/scraped-watches.ts";
import { ApiErrorDto } from "../models/api-error.dto.ts";
import { time } from "./time-and-date.ts";
import { sendErrorNotification, sendWatchNotification } from "./notification.ts";
import { errorLogger, infoLogger } from "./logger.ts";

export async function scrapeWatchInfo(watchToScrape: string): Promise<ScrapedWatch[] | ApiErrorDto> {
  let response: Response;

  try {
    response = await fetch(watchToScrape);
  } catch (err) {
    const message = `Could not fetch url ${watchToScrape}`;
    console.error(message, err);
    return {
      errorMessage: message,
    };
  }

  const body = await response.text();

  const $ = load(body);

  // Länken gav inga resultat.
  if ($(".contentRow-title").length === 0) {
    return {
      errorMessage: "Watch name yielded no results",
    };
  }

  const titles: string[] = [];
  const dates: string[] = [];
  const links: string[] = [];

  // Titel
  $(".contentRow-title")
    .get()
    .map((element) => {
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
    .map((element) => {
      const date = $(element).attr("datetime");
      if (date) {
        dates.push(date);
      }
    });

  // Länk
  $(".contentRow-title")
    .get()
    .map((element) => links.push(`https://klocksnack.se${$(element).find("a").attr("href")}`));

  const scrapedWatches: ScrapedWatch[] = [];

  titles.forEach((_, index) => {
    const currentWatchInfo: ScrapedWatch = {
      name: titles[index],
      postedDate: dates[index],
      link: links[index],
    };
    scrapedWatches.push(currentWatchInfo);
  });

  return scrapedWatches;
}

// deno-lint-ignore no-unused-vars
async function handleNewScrapedWatch(scrapedWatches: ScrapedWatch[], newScrapedWatches: ScrapedWatch[], storedWatchRowId: string) {
  // TODO: Ska det vara scrapedWatches eller newScrapedWatches?
  updateStoredWatches(scrapedWatches, storedWatchRowId);

  // Loopa över varje ny klocka och skicka mail
  for (const watch of newScrapedWatches) {
    // TODO: Ska inte try catch täcka hela compareStoredWithScraped?
    try {
      await sendWatchNotification(getEmailText(watch));

      infoLogger.info({ message: "Email sent." });
      // Skriv till databas (skapa tabell) om när ett mail skickades.

      // Vänta 5 sekunder mellan varje mail.
      await new Promise((resolve) => setTimeout(resolve, 5000));
    } catch (err) {
      await sendErrorNotification(err);
      errorLogger.error({
        message: "Function sendWatchNotification failed.",
        stacktrace: err,
      });
    }
  }
}

const getEmailText = (newScrapedWatch: ScrapedWatch) =>
  `${newScrapedWatch.name}\n\nLänk: ${newScrapedWatch.link}\n\nDetta mail skickades: ${time()}`;
