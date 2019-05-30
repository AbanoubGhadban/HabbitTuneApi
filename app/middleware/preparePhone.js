const {getPhoneRegex, preparePhone} = require('../utils/utils');

module.exports = (payloadParam = 'body', phoneParam = 'phone') => (req, res, next) => {
  const payload = req[payloadParam];
  let phone = payload[phoneParam];
  
  if (typeof(phone) !== 'string' || !getPhoneRegex().test(phone)) {
    return next();
  }
  phone = preparePhone(phone);

  req[payloadParam] = {
    ...req[payloadParam],
    [phoneParam]: phone
  };
  next();
}