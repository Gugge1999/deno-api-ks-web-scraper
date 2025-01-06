import { oakCors } from "@tajpouria/cors";
import { Application } from "@oak/oak";
import "jsr:@std/dotenv/load";

import { compareStoredWithScraped } from "./services/scraper.ts";
import errorMiddleware from "./middleware/error-middleware.ts";
import { currentTime } from "./services/time-and-date.ts";
import apiStatusRoutes from "./routes/api-status.ts";
import scraperRoutes from "./routes/bevakningar.ts";
import userRoutes from "./routes/user.ts";
import { ServiceAccount } from "npm:firebase-admin@13.0.2";
import admin from "firebase-admin";
import serviceAccount from "../serviceAccountKey.json" with { type: "json" };
import { firebaseConfig } from "./constants/config.ts";
import { initializeApp } from "npm:@firebase/app@0.10.17";

console.log(`Init api @%c ${currentTime()}`, "color: green");

const app = new Application();

app.use(oakCors());

app.use(errorMiddleware);

app.use(apiStatusRoutes.routes());
app.use(apiStatusRoutes.allowedMethods());

app.use(scraperRoutes.routes());
app.use(scraperRoutes.allowedMethods());

app.use(userRoutes.routes());
app.use(userRoutes.allowedMethods());

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as ServiceAccount),
});

export const fbApp = initializeApp(firebaseConfig);

const denoPort = Number.parseInt(Deno.env.get("PORT") || "3000");

await Promise.all([app.listen({ port: denoPort }), compareStoredWithScraped()]);
