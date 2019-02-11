const config = require('config');
const {sha256, timeAfter} = require('./utils');
const { signToken } = require('./jwt');
const RefreshToken = require('../models/RefreshToken');

const AuthenticationError = require('../errors/AuthenticationError');

const accessTokenExp = +config.get('token.accessTokenTTL');
const refreshTokenExp = +config.get('token.refreshTokenTTL');

const getRefreshTokenExpDate = () => {
    if (refreshTokenExp && !isNaN(refreshTokenExp)) {
        return timeAfter(refreshTokenExp);
    }
    return null;
}

const createRefreshToken = async (user) => {
    const data = {
        id: user.id,
        role: user.role
    };

    if (refreshTokenExp && !Number.isNaN(refreshTokenExp)){
        data.exp = timeAfter(refreshTokenExp).getTime() / 1000;
    }
    return signToken(data);
}

const createAccessToken = async (user) => {
    const data = {
        id: user.id,
        name: user.name,
        role: user.role
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

const createTokens = async (user) => {
    const accessToken = await(createAccessToken(user));
    const refreshToken = await(createRefreshToken(user));

    const tokenObj = await RefreshToken.create({
        'refreshToken': sha256(refreshToken),
        'expAt': getRefreshTokenExpDate()
    });
    await user.addRefreshToken(tokenObj);
    
    return {
        accessToken,
        refreshToken
    };
}

const refreshAccessToken = async (refreshToken, user) => {
    const tokenObj = await RefreshToken.findOne({where: {
        refreshToken: sha256(refreshToken)
    }});

    if (!tokenObj) {
        throw AuthenticationError.refreshTokenExpired();
    } else if (tokenObj.expAt && tokenObj.expAt <= (new Date())) {
        await tokenObj.destroy();
        throw AuthenticationError.refreshTokenExpired();        
    }
    
    return {
        accessToken: await createAccessToken(user),
        refreshToken
    };
}

module.exports = { 
    createTokens,
    refreshAccessToken
};
