import type { ApiStatus } from "../models/status.dto.ts";
import { formatBytes, getUptime } from "../services/status.ts";
import { Context, Router } from "@oak/oak";
import { INTERVAL_IN_MIN } from "../constants/config.ts";
import { currentTime } from "../services/time-and-date.ts";

const apiStatusRoutes = new Router({
  prefix: "/api",
});

apiStatusRoutes.get(`/api-status`, (context: Context) => {
  const socket = context.upgrade();

  socket.onclose = () => {
    console.log(`A client disconnected @ ${currentTime()}`);
  };

  socket.onopen = () => {
    return setInterval(() => {
      broadcastApiStatus(socket);
    }, 1_000);
  };
});

function broadcastApiStatus(socket: WebSocket) {
  const apiStatus = getApiStatus();

  socket.send(JSON.stringify(apiStatus));
}

const getApiStatus = (): ApiStatus => ({
  status: "active",
  scrapingIntervalInMinutes: INTERVAL_IN_MIN,
  memoryUsage: formatBytes(Deno.memoryUsage().rss),
  uptime: getUptime(),
});

export default apiStatusRoutes;
