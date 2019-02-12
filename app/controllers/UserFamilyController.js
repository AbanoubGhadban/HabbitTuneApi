const Family = require('../models/Family');
const User = require('../models/User');
const JoinCode = require('../models/JoinCode');
const ValidationError = require('../errors/ValidationError');
const errors = require('../errors/types');
const ForbiddenError = require('../errors/ForbiddenError');

const sequelize = require('../utils/database');
const _ = require('lodash');

module.exports = {
    store: async(req, res) => {
        const userId = req.params.userId;

        const userObj = await User.findOne({
            where: {id: userId},
            attributes: {
                include: [[sequelize.fn('COUNT', sequelize.col('families.id')), 'familiesCount']]
            },
            include: [{ model: Family, attributes: [] }]
        });
        
        if (userObj.role === 'mother' && userObj.get('familiesCount') !== 0) {
            throw ValidationError.from('userId', userId, errors.MOTHER_ALREADY_BELONG_TO_FAMILY);
        }

        const family = await userObj.createFamily({
            'name': req.body.name
        });
        res.send(family.get());
    },

    join: async(req, res) => {
        const userId = +req.params.userId;
        const code = req.body.code;

        const userObj = await User.findOne({
            where: {id: userId},
            attributes: {
                include: [[sequelize.fn('COUNT', sequelize.col('families.id')), 'familiesCount']]
            },
            include: [{ model: Family, attributes: [] }]
        });

        if (userObj.role === 'mother' && userObj.get('familiesCount') !== 0) {
            throw ValidationError.from('userId', userId, errors.MOTHER_ALREADY_BELONG_TO_FAMILY);
        }

        const family = await Family.findOne({
            attributes: ['id'],
            include: [{
                model: JoinCode,
                as: 'JoinCodes',
                attributes: [],
                where: {
                    code,
                    expAt: { $gt: (new Date()) }
                }
            }]
        });

        if (!family) {
            throw ValidationError.from('code', code, errors.INVALID_JOIN_CODE);
        }

        const matchedParents = await family.getUsers({
            where: {role: userObj.role}
        });
        if (!(matchedParents.length === 0)) {
            throw ValidationError.from('userId', userId, errors.ROLE_ALREADY_EXISTS);
        }
        
        await userObj.addFamily(family);
        try {
            await JoinCode.destroy({where: {familyId: family.id}});
        } catch (err) {}
        res.send({
            message: "Joined Successfully"
        });
    }
}
