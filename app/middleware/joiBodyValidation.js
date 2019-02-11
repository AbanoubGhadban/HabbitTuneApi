const joi = require('joi');

module.exports = (schema) => (req, res, next) => {
    const {error} = joi.validate(req.body, schema);
    if (error) {
        throw error;
    }
    next();
}