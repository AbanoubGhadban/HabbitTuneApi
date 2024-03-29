const validator = require('../middleware/joiBodyValidation');
const joi = require('joi');
const {getPhoneRegex} = require('../utils/utils');

module.exports = {
    registration: validator({
        name: joi.string().min(2).max(100).required(),
        phone: joi.string().regex(getPhoneRegex()).required(),
        role: joi.string().valid('father', 'mother').required(),
        password: joi.string().min(6).max(255).required(),
        fcmToken: joi.optional()
    }),

    // We shouldn't put any assumption for the length and shape of phone & password
    // Because it may be changed
    login: validator({
        phone: joi.string().min(1).required(),
        password: joi.string().min(1).required(),
        fcmToken: joi.optional()
    }),

    activate: validator({
        code: joi.string().min(1).max(20).required()
    }),

    sendResetCode: validator({
        phone: joi.string().min(1).required()
    }),

    checkResetCode: validator({
        phone: joi.string().min(1).required(),
        code: joi.string().min(1).max(20).required()
    }),

    resetPassword: validator({
        phone: joi.string().min(1).required(),
        code: joi.string().min(1).max(20).required(),
        password: joi.string().min(6).max(255).required()
    }),

    setFcmToken: validator({
        fcmToken: joi.optional()
    })
};
