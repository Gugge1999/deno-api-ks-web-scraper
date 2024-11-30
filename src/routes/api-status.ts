import type { ApiStatus } from "../models/status.dto.ts";
import { formatBytes, getUptime } from "../services/status.ts";
import { Context, Router } from "@oak/oak";
import { INTERVAL_IN_MIN } from "../constants/config.ts";
import { currentTime } from "../services/time-and-date.ts";

const STATUS_BASE_URL = "/api";

const apiStatusRoutes = new Router();

type WebSocketWithUsername = WebSocket;

// TODO: Byt från class till funktion
class ChatServer {
  private connectedClients = new Map<string, WebSocketWithUsername>();

  public handleConnection(ctx: Context) {
    const socket = ctx.upgrade() as WebSocketWithUsername;
    const username = ctx.request.url.searchParams.get("username") ?? "default-username";

    socket.onopen = this.broadcastApiStatus.bind(this);
    socket.onclose = () => {
      this.connectedClients.delete(username);
      console.log(`Client ${username} disconnected`);
    };

    this.connectedClients.set(username, socket);

    console.log(`New client connected: ${username}`);
  }

  private broadcastApiStatus() {
    this.broadcast(this.getApiStatus());

    setTimeout(() => this.broadcastApiStatus(), 5_000);
  }

  private broadcast(apiStatus: ApiStatus) {
    this.connectedClients.forEach((client) => {
      console.log("client", client);
      client.send(JSON.stringify(apiStatus));
    });
  }

  private getApiStatus(): ApiStatus {
    console.log(`total users: ${this.connectedClients.size} @ ${currentTime()}`);

    return {
      active: true,
      scrapingIntervalInMinutes: INTERVAL_IN_MIN,
      memoryUsage: formatBytes(Deno.memoryUsage().rss, 0),
      uptime: getUptime(),
    };
  }
}

const server = new ChatServer();

apiStatusRoutes.get(`${STATUS_BASE_URL}/api-status`, (ctx: Context) => server.handleConnection(ctx));

export default apiStatusRoutes;
