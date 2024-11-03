import { Application } from "@oak/oak";
import { oakCors } from "@tajpouria/cors";
import apiStatusRoutes from "./src/routes/api-status.ts";
import { errorMiddleware } from "./src/middleware/error-middleware.ts";
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

console.log("Api init");

// TODO: Ska det vara: process.env.PORT || 3000 som i node?
await app.listen({ port: 3000 });
