import { Application } from "@oak/oak";
import { oakCors } from "@tajpouria/cors";
import { currentTime } from "./services/time-and-date.ts";
import errorMiddleware from "./middleware/error-middleware.ts";
import apiStatusRoutes from "./routes/api-status.ts";
import scraperRoutes from "./routes/bevakningar.ts";

// Kolla på https://github.com/asad-mlbd/deno-api-starter-oak

const app = new Application();

app.use(oakCors());

app.use(errorMiddleware);

//OBS: Lägg märke till routes() med parenteser
app.use(apiStatusRoutes.routes());
app.use(apiStatusRoutes.allowedMethods());

app.use(scraperRoutes.routes());
app.use(scraperRoutes.allowedMethods());

console.log(`Init api @ ${currentTime()}`);

const denoPort = Number.parseInt(Deno.env.get("PORT") || "3000");

await app.listen({ port: denoPort });