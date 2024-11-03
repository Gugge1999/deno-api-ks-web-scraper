import type { ApiStatus } from "../models/status.dto.ts";
import { formatBytes, getUptime } from "../services/status.ts";
import { Router } from "@oak/oak";
import { intervalInMin } from "../config/config.ts";

const apiStatusRoutes = new Router();

apiStatusRoutes.get("/api-status", (context) => {
  const uptime: ApiStatus = {
    active: true,
    scrapingIntervalInMinutes: intervalInMin,
    memoryUsage: formatBytes(Deno.memoryUsage().rss, 0),
    uptime: getUptime(),
  };

  context.response.body = uptime;
});

export default apiStatusRoutes;
