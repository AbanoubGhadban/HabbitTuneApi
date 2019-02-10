//const ApiError = require('../errors/ApiError');
const ValidationError = require('../errors/ValidationError');
const types = require('../errors/types');

const handler = async (err, req, res, next) => {
    
    if (err.name === 'SequelizeUniqueConstraintError' && Array.isArray(err.errors) && err.errors.length > 0) {
        
        const originalErr = err.errors[0];
        const error = new ValidationError({
            message: originalErr.message,
            type: types.UNIQUE_VIOLATION,
            path: originalErr.path,
            value: originalErr.value
        });
        throw error;

    }
    
    if (err.isJoi === true && Array.isArray(err.details) && err.details.length > 0) {

        const originalErr = err.details[0];
        const error = new ValidationError({
            message: originalErr.message,
            type: originalErr.type,
            path: originalErr.path.join('.'),
            value: originalErr.value,
            meta: originalErr.context
        });
        throw error;
    }

    throw err;
}

module.exports = handler;
