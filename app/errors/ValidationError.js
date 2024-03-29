const ApiError = require('./ApiError');
const types = require('./types');

class ValidationError extends ApiError {
    static from(path, value, type, message, meta) {
        return new ValidationError({path, value, type, message, meta});
    }

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

    static invalidResetCode(value) {
        return new ValidationError({
            message: "Invalid Reset Code",
            type: types.INVALID_RESET_CODE,
            path: 'code',
            value
        });
    }

    static invalidPhoneCode(value) {
        return new ValidationError({
            message: "Invalid Phone Code",
            type: types.INVALID_PHONE_CODE,
            path: 'code',
            value
        });
    }

    static invalidJoinCode(value) {
        return new ValidationError({
            message: "Invalid Join Code",
            type: types.INVALID_JOIN_CODE,
            path: 'code',
            value
        });
    }

    static bothParentsExist(value) {
        return new ValidationError({
            message: "You can't add more parents to family, both parents exist",
            type: types.BOTH_PARENTS_EXIST,
            path: 'familyId',
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
