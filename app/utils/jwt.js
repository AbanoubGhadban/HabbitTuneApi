const fs = require('fs');
const jwt = require('jsonwebtoken');
const privateKey = fs.readFileSync('./config/jwt.key');

const signToken = async (payload) => {
    return new Promise((resolve, reject) => {
        jwt.sign(payload, privateKey, (err, token) => {
            if (err)
                reject(err);
            else
                resolve(token);
        });
    });
}

const verifyToken = async(token) => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, privateKey, (err, decoded) => {
            if (err)
                reject(err);
            else
                resolve(decoded);
        });
    });
}

module.exports = {
    signToken,
    verifyToken
};
