import { createLogger, format, transports } from "winston";

const { combine, timestamp, prettyPrint, errors, printf } = format;

const TIME_FORMAT_LOGGER = "HH:mm:ss YYYY-MM-DD";

// Byt till deno std logger: https://jsr.io/@std/log
const customFormat = format.combine(
  timestamp({ format: TIME_FORMAT_LOGGER }),
  printf((info) => `${info.message} [${info.timestamp}]`),
);

export const errorLogger = createLogger({
  format: combine(
    errors({ stack: true }),
    timestamp({ format: TIME_FORMAT_LOGGER }),
    prettyPrint(),
  ),
  exitOnError: false,
  transports: [new transports.Console(), new transports.File({ filename: "logs/error.log" })],
});

export const infoLogger = createLogger({
  format: format.combine(customFormat),
  transports: [new transports.Console(), new transports.File({ filename: "logs/info.log" })],
});
