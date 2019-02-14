const config = require('config');
const {sha256, timeAfter} = require('./utils');
const { signToken } = require('./jwt');
const RefreshToken = require('../models/RefreshToken');

const AuthenticationError = require('../errors/AuthenticationError');

const accessTokenExp = +config.get('token.accessTokenTTL');
const refreshTokenExp = +config.get('token.refreshTokenTTL');

const createRefreshToken = async (user, refreshToken) => {
    const data = {
        id: user.id,
        role: user.role,
        refreshTokenId: refreshToken._id
    };

    if (refreshTokenExp && !Number.isNaN(refreshTokenExp)){
        data.exp = timeAfter(refreshTokenExp).getTime() / 1000;
    }
    return signToken(data);
}

const createAccessToken = async (user, refreshToken) => {
    const data = {
        id: user.id,
        name: user.name,
        role: user.role,
        refreshTokenId: refreshToken._id
    };

    if (user.role === 'father' || user.role === 'mother') {
        data.phone = user.phone;
        data.group = user.group;
    }

    if (accessTokenExp && !Number.isNaN(accessTokenExp)){
        data.exp = timeAfter(accessTokenExp).getTime() / 1000;
    }
    return signToken(data);
}

// user is instance of User Model
// refreshToken is instance of RefreshToken model
const createTokensResponse = async (user, refreshToken) => {
    const accessTokenStr = await(createAccessToken(user, refreshToken));
    const refreshTokenStr = await(createRefreshToken(user, refreshToken));
    
    return {
        accessToken: accessTokenStr,
        refreshToken: refreshTokenStr,
        expAt: timeAfter(accessTokenExp)
    };
}

const createRefreshResponse = async(refreshToken, refreshTokenId, user) => {
    const accessTokenStr = await(createAccessToken(user, {_id: refreshTokenId}));
    
    return {
        accessToken: accessTokenStr,
        refreshToken,
        expAt: timeAfter(accessTokenExp)
    };
}

module.exports = { 
    createTokensResponse,
    createRefreshResponse
};
