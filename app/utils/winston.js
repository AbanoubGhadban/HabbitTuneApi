const winston = require('winston');
const filename = 'logfile.log';

//
// Create a new winston logger instance with two tranports: Console, and File
//
//
const logger = winston.createLogger({
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename })
  ]
});

logger.log('info', 'Starting Up...', { time: new Date() });

module.exports = logger;
