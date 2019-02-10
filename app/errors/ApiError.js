// Represesnts any error that will be returned to user in response

class ApiError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
    }

    getStatusCode() {
        return this.statusCode;
    }

    getResponse() {
        return {
            message: this.message
        }
    }
}

module.exports = ApiError;
