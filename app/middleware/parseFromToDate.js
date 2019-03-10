const {getDateOnly, getDiffInDays} = require('../utils/dates');
const ValidationError = require('../errors/ValidationError');
const types = require('../errors/types');

module.exports = (payloadParam = 'params') => (req, res, next) => {
  const payload = req[payloadParam];
  const {fromYear, fromMonth, fromDay, toYear, toMonth, toDay} = payload;
  const fromDate = getDateOnly(+fromYear, +fromMonth - 1, +fromDay);
  const toDate = getDateOnly(+toYear, +toMonth - 1, +toDay);

  if (getDiffInDays(fromDate, toDate) < 0) {
    throw ValidationError.from('toDate', toDate, types.END_DATE_BEFORE_START_DATE);
  }

  req.params = {
    ...req.params,
    fromDate,
    toDate
  };
  next();
}