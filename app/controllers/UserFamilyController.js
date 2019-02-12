const Family = require('../models/Family');
const User = require('../models/User');
const JoinCode = require('../models/JoinCode');
const ValidationError = require('../errors/ValidationError');
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
        
        if (userObj.role === 'mother' && userObj.familiesCount !== 0) {
            throw new ForbiddenError('MOTHER_ALREADY_BELONG_TO_FAMILY');
        }

        const family = await userObj.createFamily({
            'name': req.body.name
        });
        res.send(family.get());
    }
}
