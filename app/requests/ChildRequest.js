const validator = require('../middleware/joiBodyValidation');
const joi = require('joi');
const DateOnly = require('../utils/DateOnly');

module.exports = {
  store: validator({
      name: joi.string().min(2).max(100).required(),
      birthdate: joi.number().min(19000000).max((new DateOnly()).valueOf()).integer(),
      role: joi.string().valid('son', 'daughter').required()
  }),
  update: validator({
    name: joi.string().min(2).max(100),
    birthdate: joi.number().min(19000000).max((new DateOnly()).valueOf()).integer(),
    role: joi.string().valid('son', 'daughter')
  })
};
