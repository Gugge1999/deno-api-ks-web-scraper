import { Context, Status } from "@oak/oak";
import { errorLogger } from "../services/logger.ts";

const errorMiddleware = async (ctx: Context, next: () => Promise<unknown>) => {
  try {
    await next();
  } catch (err: unknown) {
    const message = err && typeof err === "object" && "message" in err ? err.message : "Något gick fel";
    const stack = err && typeof err === "object" && "stack" in err ? err.stack : "";
    const status = getErrorStatus(err);

    errorLogger.error({
      message: message,
      stacktrace: stack,
    });

    ctx.response.status = status;
    ctx.response.body = {
      status,
      message,
      stack,
    };
  }
};

function getErrorStatus(err: unknown): number {
  if (err && typeof err === "object" && "status" in err && typeof err.status === "number") {
    return err.status;
  }

  if (err && typeof err === "object" && "statusCode" in err && typeof err.statusCode === "number") {
    return err.statusCode;
  }

  return Status.InternalServerError;
}

export default errorMiddleware;
