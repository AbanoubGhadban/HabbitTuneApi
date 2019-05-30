//const ApiError = require('../errors/ApiError');
const ValidationError = require('../errors/ValidationError');
const AuthenticationError = require('../errors/AuthenticationError');
const NotFoundError = require('../errors/NotFoundError');
const types = require('../errors/types');

const handler = async (err, req, res, next) => {

    if (err.isJoi === true && Array.isArray(err.details) && err.details.length > 0) {

        const originalErr = err.details[0];
        const path = originalErr.path.join('.');
        let type = originalErr.type;
        if (path === 'phone' && type === 'string.regex.base') {
            type = types.NOT_SAUDI_PHONE_NUMBER;
        }

        const error = new ValidationError({
            message: originalErr.message,
            type: type,
            path: path,
            value: originalErr.value,
            meta: originalErr.context
        });
        throw error;
    }
    
    if (err.name === 'ValidationError') {
        
        const fieldName = Object.keys(err.errors)[0];
        const errorDetails = err.errors[fieldName];
        throw ValidationError.from(errorDetails.path, 
            errorDetails.value, errorDetails.kind, errorDetails.message);

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
