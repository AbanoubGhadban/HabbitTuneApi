// Thrown when user try to access something without having permissions

const ApiError = require('./ApiError');
const types = require('./types');

class ForbiddenError extends ApiError {
    constructor(type = "", message="Youd don't have permissions") {
        super(message, 403);
        this.type = type;
    }

    static userBlocked() {
        return new ForbiddenError(types.userBlocked, "User Blocked");
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
