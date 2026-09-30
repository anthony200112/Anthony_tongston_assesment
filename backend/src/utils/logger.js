import winston from 'winston';
import env from '../config/env.js';

const { combine, timestamp, printf, errors } = winston.format;

const logFormat = printf(({ level, message, timestamp: ts, stack, ...meta }) => {
  const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
  return `${ts} [${level}]: ${message}${metaStr}${stack ? `\n${stack}` : ''}`;
});

const logger = winston.createLogger({
  level: env.isProduction ? 'info' : 'debug',
  format: combine(
    errors({ stack: true }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat,
  ),
  transports: [
    new winston.transports.Console({
      format: combine(
        winston.format.colorize(),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        logFormat,
      ),
    }),
  ],
});

export default logger;
