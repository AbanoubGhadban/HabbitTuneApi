const ApiError = require('./ApiError');
const types = require('./types');

class AuthenticationError extends ApiError {
    constructor (message, type) {
        super(message, 401);
        this.type = type;
    }

    static missingToken() {
        return new AuthenticationError(
            "No access token provided",
            types.MISSING_TOKEN
        );
    }

    static missingRefreshToken() {
        return new AuthenticationError("No Refresh Token provided", types.MISSING_REFRESH_TOKEN)
    }

    static tokenExpired() {
        return new AuthenticationError("Token Expired", types.TOKEN_EXPIRED);
    }

    static refreshTokenExpired() {
        return new AuthenticationError("Refresh token expired", types.REFRESH_TOKEN_EXPIRED);
    }

    static invalidToken() {
        return new AuthenticationError("Invalid Token", types.INVALID_TOKEN);
    }

    static invalidRefreshToken() {
        return new AuthenticationError("Invalid Refresh Token", types.INVALID_REFRESH_TOKEN);
    }

    getResponse() {
        return {
            name: "AuthenticationError",
            message: this.message,
            type: this.type
        };
    }
}

module.exports = AuthenticationError;;
