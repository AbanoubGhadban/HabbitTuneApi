const validator = require('../middleware/joiBodyValidation');
const joi = require('joi');
const DateOnly = require('../utils/DateOnly');

module.exports = {
  store: validator(joi.object().keys({
      name: joi.string().min(2).max(100).required(),
      birthdate: joi.number().min(19000000).max((new DateOnly()).valueOf()).integer(),
      role: joi.string().valid('son', 'daughter').required(),
      schoolId: joi.string().regex(/^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i),
      fullName: joi.string().min(6).max(100)
  }).with('schoolId', 'fullName')),
  update: validator({
    name: joi.string().min(2).max(100),
    birthdate: joi.number().min(19000000).max((new DateOnly()).valueOf()).integer(),
    role: joi.string().valid('son', 'daughter')
  }),
  updateSchool: validator(joi.object().keys({
    fullName: joi.string().min(6).max(100),
    schoolId: joi.string().regex(/^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i)
  }).with('schoolId', 'fullName'))
};
