const winston = require('winston');
const { argv } = require('./args');

const logger = winston.createLogger({
  level: argv['log-level'],
});

if (argv['log-console']) {
  logger.add(new winston.transports.Console({
    format: winston.format[argv['log-format']](),
  }));
}

if (argv['log-file']) {
  logger.add(new winston.transports.File({
    filename: argv['log-file'],
    format: winston.format[argv['log-format']](),
  }));
}

module.exports = logger;
