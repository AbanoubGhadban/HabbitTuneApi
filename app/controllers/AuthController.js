const User = require('../models/User');
const Child = require('../models/Child');
const Family = require('../models/Family');
const bcrypt = require('bcrypt');
const Fawn = require('fawn');
const _ = require('lodash');
const config = require('config');
const { timeAfter, isParent } = require('../utils/utils');
const AuthenticationError = require('../errors/AuthenticationError');

const RefreshToken = require('../models/RefreshToken');
const RegistrationToken = require('../models/RegistrationToken');
const ValidationError = require('../errors/ValidationError');
const sequelize = require('../utils/database');

const {
    generateCode
} = require('../utils/codeGenerators');
const {
    createTokensResponse,
    createRefreshResponse
} = require('../utils/tokens');
const {
    sendActivationCode
} = require('../utils/sms');

module.exports = {
    register: async (req, res) => {
        const props = _.pick(req.body, ['name', 'phone', 'role']);
        const salt = await bcrypt.genSalt(10);
        props.password = await bcrypt.hash(req.body.password, salt);
        
        const user = new User(props);
        const activationCodeTTL = +config.get('activationCodeTTL');
        const code = await generateCode(6);
        user.activationCodes.push({
            code,
            expAt: timeAfter(activationCodeTTL)
        });

        const refreshTokenTTL = config.get('token.refreshTokenTTL');
        const refreshToken = new RefreshToken({
            expAt: refreshTokenTTL? timeAfter(refreshTokenTTL) : null
        });
        user.refreshTokens.push(refreshToken);
        await user.save();

        await sendActivationCode(user, code);
        res.send({
            user,
            tokens: await createTokensResponse(user, refreshToken)
        });
    },

    login: async(req, res) => {
        const phone = req.body.phone;
        const password = req.body.password;

        const user = await User.findOne({phone}).select('+password').exec();
        if (!user || !(await bcrypt.compare(password, user.password))) {
            throw AuthenticationError.invalidCredentials();
        }

        const refreshTokenTTL = config.get('tokens.refreshTokenTTL');
        const refreshToken = new RefreshToken({
            expAt: timeAfter(refreshTokenTTL)
        });

        res.send({
            user,
            tokens: await createTokensResponse(user, refreshToken)
        });
    },

    activate: async (req, res) => {
        const code = req.body.code;
        const userId = req.userId;

        const user = await User.findOne({
            _id: userId,
            'activationCodes.code': code,
            'activationCodes.expAt': { $gt: new Date() }
        }).exec();
        
        if (!user) {
            throw ValidationError.invalidActivationCode(code);
        } 

        const newUser = await User.findByIdAndUpdate({_id: userId}, {
            $set: {group: 'normal'},
            $unset: {activationCodes: ''}
        });
        res.send(newUser);
    },

    sendActivationCode: async (req, res) => {
        const userId = req.userId;
        const user = await User.findById(userId).select('+activationCodes').exec();
        const activationCodeTTL = +config.get('activationCodeTTL');

        // Ensure that no codes sent since two minutes
        const expectedTime = timeAfter(activationCodeTTL - 2*60);
        if (user.activationCodes) {
            for (const code of user.activationCodes) {
                if (code.expAt > expectedTime) {
                    return res.send({
                        status: "not sent",
                        message: "You can only send message every 2 minutes"
                    });
                }
            }
        }
        
        const code = generateCode(6);
        user.activationCodes.push({
            code,
            expAt: timeAfter(activationCodeTTL)
        });

        await user.save();
        sendActivationCode(user, code);

        res.send({
            status: "sent"
        });
    },

    refreshToken: async(req, res) => {
        const user = await req.user();
        const tokens = await createRefreshResponse(req.body.refreshToken, req.RefreshTokenId, user);
        res.send({
            user,
            tokens
        });
    },

    logout: async(req, res) => {
        const user = await req.user();

        // TODO: delete registration tokens
        if (user.role === 'father' || user.role === 'mother') {
            await User.findByIdAndUpdate(user._id, {
                $pull: {refreshTokens: {$elemMatch: {_id: req.refreshTokenId}}}
            });
        } else {
            await Child.findByIdAndUpdate(user._id, {
                $pull: {refreshTokens: {$elemMatch: {_id: req.refreshTokenId}}}
            });
        }

        res.send({
            message: 'Logged Out'
        });
    }
}
