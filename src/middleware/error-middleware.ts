import { Context, Status } from "@oak/oak";
import { errorLogger } from "../services/logger.ts";

const errorMiddleware = async (ctx: Context, next: () => Promise<unknown>) => {
  try {
    await next();
  } catch (err: unknown) {
    const stack = getStack(err);
    const status = getErrorStatus(err);
    const message = getErrMessage(err);

    errorLogger.error({
      message: message,
      stacktrace: stack,
    });

    // TODO: Det är nog bra med en errors sql tabell för att lättare kunna se sql fel i prod. Det kanske också går att skapa en rutin i Postgres för att rensa de gamla felmeddelandena periodiskt

    ctx.response.status = status;
    ctx.response.body = {
      message,
      stack,
    };
  }
};

function getStack(err: unknown): unknown {
  if (err && typeof err === "object" && "stack" in err) {
    return err.stack;
  }

  return "";
}

function getErrorStatus(err: unknown): number {
  if (err && typeof err === "object" && "status" in err && typeof err.status === "number") {
    return err.status;
  }

  if (err && typeof err === "object" && "statusCode" in err && typeof err.statusCode === "number") {
    return err.statusCode;
  }

  return Status.InternalServerError;
}

function getErrMessage(err: unknown): string {
  if (err && typeof err === "object" && "message" in err && typeof err.message === "string") {
    const errMsg = err.message.split(" dbError")[0];
    return errMsg;
  }

  return "Något gick fel";
}

export default errorMiddleware;
