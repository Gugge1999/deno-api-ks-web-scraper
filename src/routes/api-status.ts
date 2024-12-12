import type { ApiStatus } from "../models/status.dto.ts";
import { formatBytes, getUptime } from "../services/status.ts";
import { Context, Router } from "@oak/oak";
import { INTERVAL_IN_MIN } from "../constants/config.ts";

const apiStatusRoutes = new Router();
const connectedClients = new Map<string, WebSocket>();

const STATUS_BASE_URL = "/api";

apiStatusRoutes.get(`${STATUS_BASE_URL}/api-status`, (context: Context) => {
  const socket = context.upgrade();
  const username = context.request.url.searchParams.get("username") ?? "default-username";
  connectedClients.set(username, socket);

  socket.onclose = () => {
    connectedClients.delete(username);
    console.log(`Client ${username} disconnected!`);
  };

  socket.onopen = () => broadcastApiStatus();
});

function broadcastApiStatus() {
  const apiStatus = getApiStatus();

  connectedClients.forEach((client) => {
    client.send(JSON.stringify(apiStatus));
  });
}

const getApiStatus = (): ApiStatus => ({
  status: "active",
  scrapingIntervalInMinutes: INTERVAL_IN_MIN,
  memoryUsage: formatBytes(Deno.memoryUsage().rss),
  uptime: getUptime(),
});

setInterval(() => {
  broadcastApiStatus();
}, 1_000);

export default apiStatusRoutes;
