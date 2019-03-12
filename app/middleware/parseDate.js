const DateOnly = require('../utils/DateOnly');

module.exports = (payloadParam = 'params', dateParam = 'date') => (req, res, next) => {
  const payload = req[payloadParam];
  const {date} = payload;
  req.params = {
    ...req.params,
    [dateParam]: new DateOnly(date)
  };
  next();
}