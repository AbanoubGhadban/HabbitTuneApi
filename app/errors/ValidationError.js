const ApiError = require('./ApiError');

class ValidationError extends ApiError {
    constructor(err) {
        super(err.message, 422);
        this.type = err.type;
        this.path = err.path;
        this.value = err.value;
        this.meta = err.meta;
    }

    getResponse() {
        return {
            name: "ValidationError",
            message: this.message,
            type: this.type,
            path: this.path,
            value: this.value,
            meta: this.meta
        }
    }
}

module.exports = ValidationError;
