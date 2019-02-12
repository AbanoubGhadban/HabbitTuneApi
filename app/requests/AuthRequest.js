const validator = require('../middleware/joiBodyValidation');
const joi = require('joi');

module.exports = {
    registration: validator({
        name: joi.string().min(2).max(100).required(),
        phone: joi.string().min(5).max(20).required(),
        role: joi.string().valid('father', 'mother').required(),
        password: joi.string().min(6).max(255).required()
    }),

    // We shouldn't put any assumption for the length and shape of phone & password
    // Because it may be changed
    login: validator({
        phone: joi.string().min(1).required(),
        password: joi.string().min(1).required()
    })
};
