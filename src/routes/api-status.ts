import type { ApiStatus } from "../models/status.dto.ts";
import { formatBytes, getUptime } from "../services/status.ts";
import { Router } from "@oak/oak";
import { INTERVAL_IN_MIN } from "../config/config.ts";

const apiStatusRoutes = new Router();

const STATUS_BASE_URL = "/api";

// TODO: Byt till deno webSocket
apiStatusRoutes.get(`${STATUS_BASE_URL}/api-status`, (context) => {
  const uptime: ApiStatus = {
    active: true,
    scrapingIntervalInMinutes: INTERVAL_IN_MIN,
    memoryUsage: formatBytes(Deno.memoryUsage().rss, 0),
    uptime: getUptime(),
  };

  context.response.body = uptime;
});

export default apiStatusRoutes;
