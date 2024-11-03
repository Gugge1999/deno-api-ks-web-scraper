import { Application } from "@oak/oak";
import { oakCors } from "@tajpouria/cors";
import { time } from "./src/services/time-and-date.ts";
import errorMiddleware from "./src/middleware/error-middleware.ts";
import apiStatusRoutes from "./src/routes/api-status.ts";
import scraperRoutes from "./src/routes/scraper.ts";

// TODO: Kolla på https://github.com/asad-mlbd/deno-api-starter-oak

const app = new Application();

app.use(oakCors());

app.use(errorMiddleware);

//OBS: Lägg märke till routes() med parenteser
app.use(apiStatusRoutes.routes());
app.use(apiStatusRoutes.allowedMethods());

app.use(scraperRoutes.routes());
app.use(scraperRoutes.allowedMethods());

console.log(`Init api @${time()}`);

// TODO: Ska det vara: process.env.PORT || 3000 som i node?
await app.listen({ port: 3000 });
