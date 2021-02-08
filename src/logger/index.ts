const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(winston.format.timestamp({ format: 'DD/MM/YYYY HH:ss:ss' }), winston.format.json()),
  defaultMeta: { service: 'user-service' },
  transports: [
    new winston.transports.File({ filename: 'log/error.log', level: 'error', timestamp: true }),
    new winston.transports.File({ filename: 'log/combined.log', timestamp: true }),
  ],
});
const gapsd050Format = winston.format.printf(({
  //@ts-ignore
  level, message, label, timestamp,
}) => `${timestamp} [${label}] ${level}: ${message}`);

logger.add(new winston.transports.Console({
  format: winston.format.combine(
    winston.format.label({ label: `env: ${process.env.NODE_ENV || 'default'}` }),
    winston.format.timestamp({ format: 'DD/MM/YYYY HH:ss:ss' }),
    gapsd050Format,
  ),
}));

logger.context = (fn: string, context: string, information: string) => {
  logger[fn](`[${context}] ${information}`);
};

export default logger;