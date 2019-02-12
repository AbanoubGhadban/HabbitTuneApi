const User = require('../models/User');
const Family = require('../models/Family');
const bcrypt = require('bcrypt');
const _ = require('lodash');
const config = require('config');
const { timeAfter, isParent } = require('../utils/utils');
const AuthenticationError = require('../errors/AuthenticationError');

const ActivationCode = require('../models/ActivationCode');
const RefreshToken = require('../models/RefreshToken');
const RegistrationToken = require('../models/RegistrationToken');
const ValidationError = require('../errors/ValidationError');
const sequelize = require('../utils/database');

const {
    getActivationCode
} = require('../utils/codeGenerators');
const {
    createTokens,
    refreshAccessToken
} = require('../utils/tokens');
const {
    sendActivationCode
} = require('../utils/sms');

module.exports = {
    register: async (req, res) => {
        await sequelize.transaction(async (t) => {
            const neededProps = _.pick(req.body, ['name', 'phone', 'role']);
            const salt = await bcrypt.genSalt(10);
            neededProps.password = await bcrypt.hash(req.body.password, salt);
            
            const user = await User.create(neededProps, {transaction: t});
            const tokens = await createTokens(user, t);
            const code = await getActivationCode(user, t);
            await sendActivationCode(user, code.code);
            res.send({
                // toJson is defined at User.js file to remove passord from response
                ...user.toJson(),
                tokens
            });
        });
    },

    login: async(req, res) => {
        const phone = req.body.phone;
        const password = req.body.password;

        const user = await User.findOne({
            where: {phone},
            include: [{model: Family}]
        });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            throw AuthenticationError.invalidCredentials();
        }

        const tokens = await createTokens(user);
        res.send({
            ...user.toJson({plain: true}),
            tokens
        });
    },

    activate: async (req, res) => {
        const code = req.body.code;
        const user = await req.user();
        const codeObj = await ActivationCode.findOne({
            where: { code, userId: user.id }
        });

        if (!codeObj) {
            throw ValidationError.invalidActivationCode(code);
        } else if (codeObj.expAt && codeObj.expAt < (new Date())) {
            throw ValidationError.expiredActivationCode(code);
        }

        await user.update({
            group: 'normal'
        });
        await ActivationCode.destroy({where: {userId: user.id}});
        // toJson is defined at User.js file to remove passord from response
        res.send(user.toJson());
    },

    sendActivationCode: async (req, res) => {
        const user = await req.user();
        const activationCodeTTL = +config.get('activationCodeTTL');
        // Ensure that no codes sent since two minutes
        const expectedTime = timeAfter(activationCodeTTL - 2*60);
        const codeObj = await ActivationCode.findOne({where: {
            userId: user.id, 
            expAt: {$gt: expectedTime}
        }});

        if (codeObj) {
            return res.send({
                status: "not sent",
                message: "You can only send message every 2 minutes"
            });
        }

        await sequelize.transaction(async (t) => {
            const code = await getActivationCode(user, t);
            await sendActivationCode(user, code.code);
        });
        res.send({
            status: "sent"
        });
    },

    refreshToken: async(req, res) => {
        const tokens = await refreshAccessToken(req.body.refreshToken, await req.user());
        res.send(tokens);
    },

    logout: async(req, res) => {
        const user = await req.user();
        const clientType = isParent(user)? 'user' : 'child';

        await sequelize.transaction(async(t) => {
            await RefreshToken.destroy({
                where: {clientType, clientId: user.id},
                transaction: t
            });
            await RegistrationToken.destroy({
                where: {clientType, clientId: user.id},
                transaction: t
            });
        })

        res.send({
            message: 'Logged Out'
        });
    }
}
