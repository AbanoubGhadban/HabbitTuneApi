// Thrown when user try to access something without having permissions

const ApiError = require('./ApiError');

class ForbiddenError extends ApiError {
    constructor(type = "", message="Youd don't have permissions") {
        super(message, 403);
        this.type = type;
    }

    getResponse() {
        return {
            name: "ForbiddenError",
            message: this.message,
            type: this.type
        }
    }
}

module.exports = ForbiddenError;
