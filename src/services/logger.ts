import { createLogger, format, transports } from "winston";

const { combine, timestamp, prettyPrint, errors, printf } = format;

const TIME_FORMAT_LOGGER = "HH:mm:ss YYYY-MM-DD";
type FilePath = `logs/${string}.log`;

const customFormat = format.combine(
  timestamp({ format: TIME_FORMAT_LOGGER }),
  printf((info) => `${info.message} [${info.timestamp}]`),
);

const errorLoggerPathName: FilePath = "logs/error.log";
export const errorLogger = createLogger({
  format: combine(
    errors({ stack: true }),
    timestamp({ format: TIME_FORMAT_LOGGER }),
    prettyPrint(),
  ),
  exitOnError: false,
  transports: [new transports.Console(), new transports.File({ filename: errorLoggerPathName })],
});

const infoLoggerPathName: FilePath = "logs/info.log";
export const infoLogger = createLogger({
  format: format.combine(customFormat),
  transports: [new transports.Console(), new transports.File({ filename: infoLoggerPathName })],
});
