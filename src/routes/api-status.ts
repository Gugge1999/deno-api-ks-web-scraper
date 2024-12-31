import type { ApiStatus } from "../models/status.dto.ts";
import { formatBytes, getUptime } from "../services/status.ts";
import { Context, Router } from "@oak/oak";
import { INTERVAL_IN_MIN } from "../constants/config.ts";
import { currentTime } from "../services/time-and-date.ts";

const apiStatusRoutes = new Router({
  prefix: "/api",
});

apiStatusRoutes.get(`/status`, (context: Context) => {
  const socket = context.upgrade();

  socket.onclose = () => {
    console.log(`A client disconnected @ ${currentTime()}`);
  };

  socket.onopen = () => setInterval(() => broadcastApiStatus(socket), 1_000);
});

function broadcastApiStatus(socket: WebSocket): void {
  const apiStatus = getApiStatus();

  socket.send(JSON.stringify(apiStatus));
}

function getApiStatus(): ApiStatus {
  return {
    status: "active",
    scrapingIntervalInMinutes: INTERVAL_IN_MIN,
    memoryUsage: formatBytes(Deno.memoryUsage().rss),
    uptime: getUptime(),
  };
}

export default apiStatusRoutes;
