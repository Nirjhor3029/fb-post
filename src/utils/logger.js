const winston = require('winston');
const config = require('../config');

const logFormat = winston.format.printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level.toUpperCase()}]: ${message}`;
});

const logger = winston.createLogger({
  level: config.nodeEnv === 'development' ? 'debug' : 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    config.nodeEnv === 'production'
      ? winston.format.json()
      : winston.format.combine(winston.format.colorize(), logFormat)
  ),
  transports: [
    new winston.transports.Console(),
  ],
});

module.exports = logger;
