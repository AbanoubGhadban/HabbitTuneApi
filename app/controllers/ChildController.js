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
    update: async(req, res) => {
        const childId = req.params.childId;
        const child = Child.findOne({id: childId});

        const props = _.pick(['name', 'role']);
        await child.update(props);
        res.send(child.get({plain: true}));
    }
}
