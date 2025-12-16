import winston from "winston";
import { argv } from "./args.js";

const logger = winston.createLogger({
  level: argv["log-level"],
});

if (argv["log-console"]) {
  logger.add(
    new winston.transports.Console({
      format: (winston.format as any)[argv["log-format"]](),
    }),
  );
}

if (argv["log-file"]) {
  logger.add(
    new winston.transports.File({
      filename: argv["log-file"],
      format: (winston.format as any)[argv["log-format"]](),
    }),
  );
}

export default logger;
