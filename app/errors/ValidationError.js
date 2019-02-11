const ApiError = require('./ApiError');
const types = require('./types');

class ValidationError extends ApiError {
    constructor(err) {
        super(err.message, 422);
        this.type = err.type;
        this.path = err.path;
        this.value = err.value;
        this.meta = err.meta;
    }

    static invalidActivationCode(value) {
        return new ValidationError({
            message: "Invalid Activation Code",
            type: types.INVALID_ACTIVATION_CODE,
            path: 'code',
            value
        });
    }

    static expiredActivationCode(value) {
        return new ValidationError({
            message: "Expired Activation Code",
            type: types.EXPIRED_ACTIVATION_CODE,
            path: 'code',
            value
        });
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