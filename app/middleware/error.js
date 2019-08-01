const ApiError = require('../errors/ApiError');
const winston = require('../utils/winston');

const handler = (err, req, res, next) => {
    if (err instanceof ApiError)
        res.status(err.getStatusCode()).send(err.getResponse());
    else {
        try {
            winston.log('error', 'Server Error', {
                ...err,
                location: __filename,
                time: new Date()
            });
        } catch (ex) {}
        res.status(500).json(JSON.stringify(err));
    }
    console.log(err);
}

module.exports = handler;
