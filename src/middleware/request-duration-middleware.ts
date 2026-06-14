import { Context } from "@oak/oak";
import { currentDateAndTime } from "../services/time-and-date.ts";

/**
 * Middleware to log HTTP endpoint execution duration
 * Handles WebSocket upgrades (logs them with 101 Switching Protocols)
 */
const requestDurationMiddleware = async (ctx: Context, next: () => Promise<unknown>) => {
  const startTime = performance.now();
  const method = ctx.request.method;
  const path = ctx.request.url.pathname;

  try {
    await next();
  } finally {
    const endTime = performance.now();
    const durationMs = endTime - startTime;

    // Check if this was a WebSocket upgrade by looking at the connection header
    // WebSocket requests have: Connection: Upgrade and Upgrade: websocket headers
    const isWebSocketUpgrade = (ctx.request.headers
      .get("connection")
      ?.toLowerCase()
      .includes("upgrade")) &&
      ctx.request.headers.get("upgrade")?.toLowerCase() === "websocket";

    // If it's a WebSocket upgrade, log with 101 status
    // Otherwise log with the actual response status
    const status = isWebSocketUpgrade ? `101 (WebSocket)` : (ctx.response.status || 200);

    console.log(
      `${method} ${path} - Status: ${status} - Duration: ${durationMs.toFixed(2)}ms %c${currentDateAndTime()}`,
      "color: deepskyblue",
    );
  }
};

export default requestDurationMiddleware;
