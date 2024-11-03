import type { ApiStatus } from "../models/status.dto.ts";
import { formatBytes, getUptime } from "../services/status.ts";
import { Router } from "@oak/oak";

const apiStatusRoutes = new Router();

apiStatusRoutes.get("/api-status", (context) => {
  const uptime: ApiStatus = {
    active: true,
    // TODO: Hämta från config
    scrapingIntervalInMinutes: 10,
    memoryUsage: formatBytes(Deno.memoryUsage().rss, 0),
    uptime: getUptime(),
  };

  context.response.body = uptime;
});

export default apiStatusRoutes;
