const ValidationError = require('../errors/ValidationError');
const types = require('../errors/types');
const DateOnly = require('../utils/DateOnly');

module.exports = (payloadParam = 'params') => (req, res, next) => {
  const payload = req[payloadParam];
  let {fromDate, toDate} = payload;
  fromDate = new DateOnly(fromDate);
  toDate = new DateOnly(toDate);

  if (fromDate > toDate) {
    throw ValidationError.from('toDate', toDate, types.END_DATE_BEFORE_START_DATE);
  }

  req.params = {
    ...req.params,
    fromDate,
    toDate
  };
  next();
}