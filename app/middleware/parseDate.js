const {getDateOnly} = require('../utils/dates');

module.exports = (payloadParam = 'params', dateParam = 'date') => (req, res, next) => {
  const payload = req[payloadParam];
  const {year, month, day} = payload;
  const date = getDateOnly(+year, +month - 1, +day);
  req.params = {
    ...req.params,
    [dateParam]: date
  };
  next();
}