import { initializeApp } from "npm:@firebase/app@0.10.17";
import { oakCors } from "@tajpouria/cors";
import { Application } from "@oak/oak";
import admin from "firebase-admin";
import "jsr:@std/dotenv/load";
import { compareStoredWithScraped } from "./services/scraper.ts";
import errorMiddleware from "./middleware/error-middleware.ts";
import { currentTime } from "./services/time-and-date.ts";
import apiStatusRoutes from "./routes/api-status.ts";
import scraperRoutes from "./routes/bevakningar.ts";
import userRoutes from "./routes/user.ts";

console.log(`Init api @%c ${currentTime()}`, "color: green");

const app = new Application();

// app.use(oakCors({
//   credentials: true,
//   origin: true,
// }));

app.use(oakCors());

app.use(errorMiddleware);

app.use(apiStatusRoutes.routes());
app.use(apiStatusRoutes.allowedMethods());

app.use(scraperRoutes.routes());
app.use(scraperRoutes.allowedMethods());

app.use(userRoutes.routes());
app.use(userRoutes.allowedMethods());

const firebaseConfig = {
  apiKey: Deno.env.get("FBAPIKEY") ?? "",
  authDomain: Deno.env.get("FBAUTHDOMAIN") ?? "",
  projectId: Deno.env.get("FBPROJECTID") ?? "",
  storageBucket: Deno.env.get("FBSTORAGEBUCKET") ?? "",
  messagingSenderId: Deno.env.get("FBMESSAGINGSENDERID") ?? "",
  appId: Deno.env.get("FBAPPID") ?? "",
} as const;

export const fbApp = initializeApp(firebaseConfig);

// OBS: Lägg märke till import av @std/dotenv/load. Utan den fungerar inte .env
const denoPort = Number.parseInt(Deno.env.get("PORT") || "3000");

const cert = JSON.parse(Deno.env.get("FBSERVICEACCOUNTKEY") ?? "");

admin.initializeApp({ credential: admin.credential.cert(cert) });

await Promise.all([app.listen({ port: denoPort }), compareStoredWithScraped()]);
