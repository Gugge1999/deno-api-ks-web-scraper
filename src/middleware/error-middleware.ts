import { Context, Status } from "@oak/oak";
import { errorLogger } from "../services/logger.ts";

const errorMiddleware = async (ctx: Context, next: () => Promise<unknown>) => {
  try {
    await next();
    // TODO: Byt från any sen
  } catch (err: any) {
    // TODO: Lägg till verbose error message här?
    const message = err && typeof err === "object" && "message" in err ? err.message : "Något gick fel";
    const status = err.status || err.statusCode || Status.InternalServerError;
    const stack = err.stack ?? "";

    errorLogger.error({
      message: message,
      stacktrace: stack,
    });

    console.error("här");

    ctx.response.status = status;
    ctx.response.body = { status, message, stack };
  }
};

export default errorMiddleware;
