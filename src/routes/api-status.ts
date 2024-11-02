import type { ApiStatus } from "../models/status.dto.ts";
import { formatBytes, getUptime } from "../services/status.ts";
import type { ApiErrorDto } from "../models/api-error.dto.ts";
import { Router } from "@oak/oak";

const apiStatusRoutes = new Router();

apiStatusRoutes.get("/api-status", (context) => {
  try {
    const uptime: ApiStatus = {
      active: true,
      // TODO: Hämta från config
      scrapingIntervalInMinutes: 10 * 60_000 / 60000,
      memoryUsage: formatBytes(Deno.memoryUsage().rss, 0),
      uptime: getUptime(),
    };

    context.response.body = uptime;
  } catch (err) {
    console.log(err);
    const errorMessage = err && typeof err === "string" ? err : "Något gick fel";

    const errorDto: ApiErrorDto = {
      errorMessage: errorMessage,
    };

    context.response.body = errorDto;

    context.response.status = 500;
  }
});

export default apiStatusRoutes;
