const Family = require('../models/Family');
const User = require('../models/User');
const Child = require('../models/Child');
const JoinCode = require('../models/JoinCode');
const ChildLoginCode = require('../models/ChildLoginCode');
const ValidationError = require('../errors/ValidationError');
const errors = require('../errors/types');
const ForbiddenError = require('../errors/ForbiddenError');

const sequelize = require('../utils/database');
const _ = require('lodash');

module.exports = {
    index: async(req, res) => {
        const familyId = req.params.familyId;
        const family = await Family.findOne({
            where: {id: familyId},
            include: [{model: Child}]
        });

        res.send(family.get({plain: true}).children);
    },

    store: async(req, res) => {
        const familyId = req.params.familyId;
        const props = _.pick(req.body, ['name', 'role']);

        const child = await Child.create({
            ...props,
            familyId
        });
        res.send(child.get({plain: true}));
    }
}
