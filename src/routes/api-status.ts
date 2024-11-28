import type { ApiStatus } from "../models/status.dto.ts";
import { formatBytes, getUptime } from "../services/status.ts";
import { Context, Router } from "@oak/oak";
import { INTERVAL_IN_MIN } from "../constants/config.ts";

const apiStatusRoutes = new Router();

const STATUS_BASE_URL = "/api";

// TODO: Byt till deno webSocket
apiStatusRoutes.get(`${STATUS_BASE_URL}/api-status-old`, (context) => {
  const uptime: ApiStatus = {
    active: true,
    scrapingIntervalInMinutes: INTERVAL_IN_MIN,
    memoryUsage: formatBytes(Deno.memoryUsage().rss, 0),
    uptime: getUptime(),
  };

  context.response.body = uptime;
});

const router = new Router();

type WebSocketWithUsername = WebSocket;
type AppEvent = { event: string; [key: string]: any };

class ChatServer {
  private connectedClients = new Map<string, WebSocketWithUsername>();

  public handleConnection(ctx: Context) {
    const socket = ctx.upgrade() as WebSocketWithUsername;
    const username = ctx.request.url.searchParams.get("username") ?? "";

    socket.onopen = this.broadcastApiStatus.bind(this);
    socket.onclose = () => {
      console.log(`Client disconnected`);
    };

    this.connectedClients.set(username, socket);

    console.log(`New client connected: ${username}`);
  }

  private broadcastApiStatus() {
    this.broadcast({ event: "update-users", apiStatus: this.getApiStatus() });

    setInterval(() => this.broadcast({ event: "update-users", apiStatus: this.getApiStatus() }), 2_000);
  }

  private broadcast(message: AppEvent) {
    const messageString = JSON.stringify(message);
    for (const client of this.connectedClients.values()) {
      client.send(messageString);
    }
  }

  private getApiStatus(): ApiStatus {
    return {
      active: true,
      scrapingIntervalInMinutes: INTERVAL_IN_MIN,
      memoryUsage: formatBytes(Deno.memoryUsage().rss, 0),
      uptime: getUptime(),
    };
  }
}

const server = new ChatServer();

router.get("/api-status", (ctx: Context) => server.handleConnection(ctx));

router.get("/wss", (ctx) => {
  if (!ctx.isUpgradable) {
    ctx.throw(501);
  }
  const ws = ctx.upgrade();
  ws.onopen = () => {
    console.log("Connected to client");
    ws.send("Hello from server!");
  };
  ws.onmessage = (m) => {
    console.log("Got message from client: ", m.data);
    ws.send(m.data as string);
    ws.close();
  };
  ws.onclose = () => console.log("Disconncted from client");
});

export default router;
