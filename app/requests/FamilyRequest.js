const validator = require('../middleware/joiBodyValidation');
const joi = require('joi');

module.exports = {
    store: validator({
        name: joi.string().min(2).max(100).required()
    })
};
