const validator = require('../middleware/joiBodyValidation');
const joi = require('joi');

module.exports = {
    post: validator({
        name: joi.string().min(2).max(100).required(),
        phone: joi.string().min(5).max(20).required(),
        role: joi.string().valid('father', 'mother').required(),
        group: joi.string().valid('blocked', 'pending', 'normal', 'admin').optional(),
        password: joi.string().min(6).max(255).required()
    }),

    update: {
        name: joi.string().min(2).max(100).optional(),
        phone: joi.string().min(5).max(20).optional(),
        role: joi.string().valid('father', 'mother').optional(),
        group: joi.string().valid('blocked', 'pending', 'normal', 'admin').optional(),
        password: joi.string().min(6).max(255).optional()
    }
};
