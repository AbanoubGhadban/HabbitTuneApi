const {delay} = require('../utils/utils');

const delayMiddleware = (duration=500) => {
  return async (req, res, next) => {
    await delay(duration);
    next();
  }
}

module.exports = delayMiddleware;
