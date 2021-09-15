import winston from 'winston';
import fs from 'fs';

const logDir = 'logs';

// Create the log directory if it does not exist
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}
let logLevel = 'error';

const transports = [
  new winston.transports.File({
    level: winston.config.npm.levels,
    filename: `${logDir}/${logLevel}.log`,
    handleExceptions: true,
    json: true,
    maxsize: 10485760, // 10MB
    maxFiles: 5,
    colorize: false,
  })
];

if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development')
  transports.push(new winston.transports.Console({
    level: 'debug',
    handleExceptions: true,
    json: false,
    colorize: true,
  }));

const logger = new winston.createLogger({ level: winston.config.npm.levels, transports: transports, exitOnError: false });

module.exports = logger;

module.exports.stream = {
  write: (message) => {
    logger.info(message);
  }
};
