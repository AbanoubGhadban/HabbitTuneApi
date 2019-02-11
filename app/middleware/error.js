const ApiError = require('../errors/ApiError');

const handler = (err, req, res, next) => {
    if (err instanceof ApiError)
        res.status(err.getStatusCode()).send(err.getResponse());
    else
        res.status(500).send(err);
    console.log(err);
}

module.exports = handler;
