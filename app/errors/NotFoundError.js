const ApiError = require('./ApiError');

class NotFoundError extends ApiError {
  constructor(object, value, message) {
    super(message, 404);
    this.object = object;
    this.value = value;
  }

  getResponse() {
    return {
      name: "NotFoundError",
      message: this.message,
      object: this.object,
      value: this.value
    };
  }
}

module.exports = NotFoundError;
