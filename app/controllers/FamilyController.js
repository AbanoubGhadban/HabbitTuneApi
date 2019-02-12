const Family = require('../models/Family');
const User = require('../models/User');
const Child = require('../models/Child');
const JoinCode = require('../models/JoinCode');
const ValidationError = require('../errors/ValidationError');
const ForbiddenError = require('../errors/ForbiddenError');

const sequelize = require('../utils/database');
const _ = require('lodash');

const {
    getJoinCode
} = require('../utils/codeGenerators');

module.exports = {
    generateJoinCode: async (req, res) => {
        const familyId = req.body.familyId;
        const familyObj = await Family.findOne({
            where: {id: familyId},
            attributes: {
                include: [[sequelize.fn('COUNT', sequelize.col('Users.id'), 'usersCount')]]
            },
            include: [{ model: User }]
        });

        if (familyObj.usersCount > 1) {
            throw ValidationError.bothParentsExist();
        }
        const code = await getJoinCode(familyObj);

        res.send({
            code,
            family: familyObj.get()
        });
    },
}
