const validator = require('../middleware/joiBodyValidation');
const joi = require('joi');
const {getPhoneRegex} = require('../utils/utils');

module.exports = {
    post: validator({
        name: joi.string().min(2).max(100).required(),
        phone: joi.string().regex(getPhoneRegex()).required(),
        role: joi.string().valid('father', 'mother').required(),
        group: joi.string().valid('blocked', 'pending', 'normal', 'admin').optional(),
        password: joi.string().min(6).max(255).required()
    }),

    update: validator({
        name: joi.string().min(2).max(100).optional(),
        phone: joi.string().regex(getPhoneRegex()).optional(),
        role: joi.string().valid('father', 'mother').optional(),
        group: joi.string().valid('blocked', 'pending', 'normal', 'admin').optional(),
        password: joi.string().min(6).max(255).optional()
    }),

    updateName: validator({
        name: joi.string().min(2).max(100).required()
    }),

    updatePassword: validator({
        oldPassword: joi.string().max(100).required(),
        password: joi.string().min(6).max(255).required()
    }),

    getPhoneCode: validator({
        phone: joi.string().regex(getPhoneRegex()).required()
    }),

    updatePhone: validator({
        code: joi.string().min(1).max(20).required()
    })
};
