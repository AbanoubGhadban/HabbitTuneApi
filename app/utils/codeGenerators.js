const JoinCode = require('../models/JoinCode');

const config = require('config');
const { timeAfter } = require('./utils');

const activationCodeTTL = config.get('activationCodeTTL');
const joinCodeTTL = config.get('joinCodeTTL');

const generateCode = async (len) => {
    const possible = "abcdefghijklmnopqrstuvwxyz0123456789";
    let code = "";
    for (var i = 0; i < len;++i) {
        const index = Math.floor(Math.random() * possible.length);
        code += possible.charAt(index);
    }
    return code;
}

// Generate Joi code and add it to db
// Return Object of JoinCode model
const getJoinCode = async(family, transaction) => {
    // If user generated code recentrly, return it
    const allowanceTime = timeAfter(.25*joinCodeTTL);
    const oldCode = await JoinCode.findOne({
        where: {expAt: {$gt: allowanceTime}},
        familyId: family.id
    });
    if (oldCode) {
        return oldCode;
    }

    for (let i = 0;i < 1000;++i) {
        const code = await generateCode(6);
        const codeObj = await JoinCode.findOne({where: {code}});

        if (codeObj && (codeObj.expAt > new Date()))
            continue;

        // If code already exist but expired, delete it
        if (codeObj) {
            await codeObj.destroy({transaction});
        }
        const newCode = family.createJoinCode({
            'code': code,
            'expAt': timeAfter(joinCodeTTL)
        });
        return newCode;
    }
    throw new Error('Failed to generate activation code');
}

module.exports = {
    generateCode,
    getJoinCode
};
