//const ApiError = require('../errors/ApiError');
const ValidationError = require('../errors/ValidationError');
const AuthenticationError = require('../errors/AuthenticationError');
const NotFoundError = require('../errors/NotFoundError');
const types = require('../errors/types');

const handler = async (err, req, res, next) => {
    
    if (err.name === 'ValidationError') {
        
        const fieldName = Object.keys(err.errors)[0];
        const errorDetails = err.errors[fieldName];
        throw ValidationError.from(errorDetails.path, 
            errorDetails.value, errorDetails.kind, errorDetails.message);

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

    if (err.name === "JsonWebTokenError") {
        throw AuthenticationError.invalidToken();
    }

    if (err.name === "TokenExpiredError") {
        throw AuthenticationError.tokenExpired();
    }

    if (err.name === "CastError" && err.kind === "ObjectId") {
        throw new NotFoundError("", err.value);
    }

    throw err;
}

module.exports = handler;
