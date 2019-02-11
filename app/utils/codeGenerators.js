const ActivationCode = require('../models/ActivationCode');
const JoinCode = require('../models/JoinCode');

const config = require('config');
const { timeAfter } = require('./utils');

const activationCodeTTL = config.get('activationCodeTTL');
const joinCodeTTL = config.get('joinCodeTTL');

const generateCode = async (user, len) => {
    const possible = "abcdefghijklmnopqrstuvwxyz0123456789";
    let code = "";
    for (var i = 0; i < len;++i) {
        const index = Math.floor(Math.random() * possible.length);
        code += possible.charAt(index);
    }
    return code;
}

// Generate activation code and add it to db
// Return Object of ActivationCode model
const getActivationCode = async(user, transaction) => {
    for (let i = 0;i < 1000;++i) {
        const code = await generateCode(user, 6);
        const codeObj = await ActivationCode.findOne({where: {code}});

        if (codeObj && (codeObj.expAt > new Date()))
            continue;

        // If code already exist but expired, delete it
        if (codeObj) {
            await codeObj.destroy({transaction});
        }
        const newCode = ActivationCode.build({
            'code': code,
            'expAt': timeAfter(activationCodeTTL),
            'userId': user.id
        });
        await newCode.save({transaction});
        return newCode;
    }
    throw new Error('Failed to generate activation code');
}

// Generate Joi code and add it to db
// Return Object of JoinCode model
const getJoinCode = async(family, transaction) => {
    for (let i = 0;i < 1000;++i) {
        const code = await generateCode(user, 6);
        const codeObj = await JoinCode.findOne({where: {code}});

        if (codeObj && (codeObj.expAt > new Date()))
            continue;

        // If code already exist but expired, delete it
        if (codeObj) {
            await codeObj.destroy({transaction});
        }
        const newCode = ActivationCode.build({
            'code': code,
            'expAt': timeAfter(joinCodeTTL),
            'familyId': family.id
        });
        await newCode.save({transaction});
        return newCode;
    }
    throw new Error('Failed to generate activation code');
}

module.exports = {
    getActivationCode,
    getJoinCode
};
